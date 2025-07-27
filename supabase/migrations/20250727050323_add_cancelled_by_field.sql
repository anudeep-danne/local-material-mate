-- Add cancelled_by field to orders table
-- This field tracks who cancelled the order (vendor or supplier)

-- Add the cancelled_by column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancelled_by TEXT CHECK (cancelled_by IN ('vendor', 'supplier'));

-- Add an index for better performance when filtering by cancelled_by
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_by ON public.orders(cancelled_by);

-- Update existing cancelled orders to have cancelled_by set to 'supplier' as default
-- (assuming most existing cancelled orders were cancelled by suppliers)
UPDATE public.orders 
SET cancelled_by = 'supplier' 
WHERE status = 'Cancelled' AND cancelled_by IS NULL;

-- Ensure RLS policies allow updates to cancelled_by field
DROP POLICY IF EXISTS "Enable all order operations for authenticated users" ON public.orders;
CREATE POLICY "Enable all order operations for authenticated users" ON public.orders
  FOR ALL USING (true) WITH CHECK (true); 