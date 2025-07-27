-- Fix cart quantity update issues
-- This migration ensures cart quantity updates work properly

-- First, let's verify the cart table structure
-- Ensure the cart table has all required columns
DO $$
BEGIN
  -- Check if cart table exists and has required columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart' 
    AND column_name = 'id'
  ) THEN
    RAISE EXCEPTION 'Cart table does not exist or is missing required columns';
  END IF;
END $$;

-- Clean up any invalid cart data that might be causing issues
DELETE FROM public.cart WHERE id IS NULL;
DELETE FROM public.cart WHERE vendor_id IS NULL;
DELETE FROM public.cart WHERE product_id IS NULL;
DELETE FROM public.cart WHERE quantity IS NULL OR quantity <= 0;

-- Ensure the cart table has proper constraints
ALTER TABLE public.cart ALTER COLUMN quantity SET NOT NULL;
ALTER TABLE public.cart ALTER COLUMN quantity SET DEFAULT 1;
ALTER TABLE public.cart ADD CONSTRAINT cart_quantity_positive CHECK (quantity > 0);

-- Create a function to safely update cart quantities
CREATE OR REPLACE FUNCTION update_cart_quantity_safe(
  cart_item_id UUID,
  new_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_quantity INTEGER;
BEGIN
  -- Get current quantity
  SELECT quantity INTO current_quantity 
  FROM public.cart 
  WHERE id = cart_item_id;
  
  -- Check if cart item exists
  IF current_quantity IS NULL THEN
    RAISE EXCEPTION 'Cart item not found';
  END IF;
  
  -- Update quantity
  IF new_quantity <= 0 THEN
    -- Remove item if quantity is 0 or negative
    DELETE FROM public.cart WHERE id = cart_item_id;
  ELSE
    -- Update quantity
    UPDATE public.cart 
    SET quantity = new_quantity, updated_at = NOW()
    WHERE id = cart_item_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update cart quantity: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Create a function to safely add items to cart
CREATE OR REPLACE FUNCTION add_to_cart_safe(
  vendor_id_param UUID,
  product_id_param UUID,
  quantity_param INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  cart_item_id UUID;
  existing_quantity INTEGER;
BEGIN
  -- Check if item already exists in cart
  SELECT id, quantity INTO cart_item_id, existing_quantity
  FROM public.cart 
  WHERE vendor_id = vendor_id_param AND product_id = product_id_param;
  
  IF cart_item_id IS NOT NULL THEN
    -- Update existing item
    UPDATE public.cart 
    SET quantity = existing_quantity + quantity_param, updated_at = NOW()
    WHERE id = cart_item_id;
    RETURN cart_item_id;
  ELSE
    -- Create new item
    INSERT INTO public.cart (vendor_id, product_id, quantity)
    VALUES (vendor_id_param, product_id_param, quantity_param)
    RETURNING id INTO cart_item_id;
    RETURN cart_item_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to add to cart: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION update_cart_quantity_safe IS 'Safely updates cart item quantity with proper error handling';
COMMENT ON FUNCTION add_to_cart_safe IS 'Safely adds items to cart with proper error handling';

