-- Fix foreign key constraints to allow proper product deletion
-- Drop existing foreign key constraints
ALTER TABLE public.cart DROP CONSTRAINT IF EXISTS cart_product_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_product_id_fkey;

-- Recreate foreign key constraints with CASCADE DELETE
ALTER TABLE public.cart 
ADD CONSTRAINT cart_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create a function to safely delete products
CREATE OR REPLACE FUNCTION delete_product_safe(product_id UUID, supplier_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the product exists and belongs to the supplier
  IF NOT EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND supplier_id = delete_product_safe.supplier_id
  ) THEN
    RETURN FALSE;
  END IF;

  -- Delete the product (cascade will handle related records)
  DELETE FROM public.products 
  WHERE id = product_id AND supplier_id = delete_product_safe.supplier_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 