-- Add accepted_by field to orders table
-- This field tracks who accepted the order

-- Add the accepted_by column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS accepted_by TEXT CHECK (accepted_by IN ('supplier'));

-- Add an index for better performance when filtering by accepted_by
CREATE INDEX IF NOT EXISTS idx_orders_accepted_by ON public.orders(accepted_by);

-- Update existing pending orders to have accepted_by set to 'supplier' as default
-- (assuming most existing pending orders were accepted by suppliers)
UPDATE public.orders 
SET accepted_by = 'supplier' 
WHERE status = 'Pending' AND accepted_by IS NULL;

-- Ensure RLS policies allow updates to accepted_by field
DROP POLICY IF EXISTS "Allow all operations for testing" ON public.orders;
CREATE POLICY "Allow all operations for testing" ON public.orders
  FOR ALL USING (true) WITH CHECK (true); 