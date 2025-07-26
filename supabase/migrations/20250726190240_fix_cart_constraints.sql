-- Fix cart table constraints and ensure proper functionality
-- This migration addresses cart issues and ensures real-time functionality

-- First, let's check and clean up any existing cart data that might be causing issues
DELETE FROM public.cart WHERE vendor_id IS NULL OR product_id IS NULL;

-- Drop the unique constraint that might be causing issues
ALTER TABLE public.cart DROP CONSTRAINT IF EXISTS cart_vendor_id_product_id_key;

-- Recreate the unique constraint properly
ALTER TABLE public.cart ADD CONSTRAINT cart_vendor_id_product_id_key UNIQUE (vendor_id, product_id);

-- Ensure all foreign key constraints are properly set up
ALTER TABLE public.cart DROP CONSTRAINT IF EXISTS cart_vendor_id_fkey;
ALTER TABLE public.cart ADD CONSTRAINT cart_vendor_id_fkey 
  FOREIGN KEY (vendor_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.cart DROP CONSTRAINT IF EXISTS cart_product_id_fkey;
ALTER TABLE public.cart ADD CONSTRAINT cart_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Ensure RLS policies are properly set up for all operations
DROP POLICY IF EXISTS "Allow all cart operations for development" ON public.cart;

-- Create comprehensive RLS policies
CREATE POLICY "Allow cart select for all" ON public.cart
  FOR SELECT USING (true);

CREATE POLICY "Allow cart insert for all" ON public.cart
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow cart update for all" ON public.cart
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow cart delete for all" ON public.cart
  FOR DELETE USING (true);

-- Ensure the cart table has proper triggers for real-time updates
CREATE OR REPLACE FUNCTION notify_cart_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify real-time subscribers about cart changes
  PERFORM pg_notify('cart_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'type', TG_OP,
    'record', row_to_json(NEW),
    'old_record', row_to_json(OLD)
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS cart_changes_trigger ON public.cart;

-- Create trigger for real-time notifications
CREATE TRIGGER cart_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cart
  FOR EACH ROW
  EXECUTE FUNCTION notify_cart_changes();

-- Add comments for documentation
COMMENT ON TABLE public.cart IS 'Shopping cart with real-time updates and proper constraints';
COMMENT ON FUNCTION notify_cart_changes() IS 'Triggers real-time notifications for cart changes'; 