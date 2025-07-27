-- Add stock management functionality

-- Function to reduce stock atomically when an order is placed
CREATE OR REPLACE FUNCTION reduce_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Get current stock with row lock to prevent race conditions
  SELECT stock INTO current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;
  
  -- Check if product exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Check if enough stock is available
  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, p_quantity;
  END IF;
  
  -- Reduce stock
  UPDATE products
  SET stock = stock - p_quantity,
      updated_at = now()
  WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$;

-- Function to restore stock when an order is cancelled
CREATE OR REPLACE FUNCTION restore_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Restore stock
  UPDATE products
  SET stock = stock + p_quantity,
      updated_at = now()
  WHERE id = p_product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add stock validation to products table
ALTER TABLE products 
ADD CONSTRAINT products_stock_check 
CHECK (stock >= 0);

-- Create index for better stock query performance
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Add trigger to log stock changes
CREATE TABLE IF NOT EXISTS stock_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  old_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('order_placed', 'order_cancelled', 'manual_update')),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to log stock changes
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.stock != NEW.stock THEN
    INSERT INTO stock_changes (
      product_id,
      old_stock,
      new_stock,
      change_amount,
      change_type,
      order_id
    ) VALUES (
      NEW.id,
      OLD.stock,
      NEW.stock,
      OLD.stock - NEW.stock,
      CASE 
        WHEN TG_OP = 'UPDATE' AND OLD.stock > NEW.stock THEN 'order_placed'
        WHEN TG_OP = 'UPDATE' AND OLD.stock < NEW.stock THEN 'order_cancelled'
        ELSE 'manual_update'
      END,
      NULL -- order_id will be set by application logic
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for stock change logging
DROP TRIGGER IF EXISTS products_stock_change_trigger ON products;
CREATE TRIGGER products_stock_change_trigger
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_change();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION reduce_product_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_product_stock(UUID, INTEGER) TO authenticated;
GRANT SELECT, INSERT ON stock_changes TO authenticated; 