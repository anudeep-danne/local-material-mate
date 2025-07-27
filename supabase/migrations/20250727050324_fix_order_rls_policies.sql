-- Fix RLS policies for orders table to ensure proper access
-- This ensures that suppliers and vendors can update their orders

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all order operations for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;

-- Create comprehensive policies for orders table
-- Policy for viewing orders (vendors can see their orders, suppliers can see orders for their products)
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = vendor_id OR 
    auth.uid() = supplier_id
  );

-- Policy for updating orders (suppliers can update orders for their products, vendors can update their orders)
CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = vendor_id OR 
    auth.uid() = supplier_id
  ) WITH CHECK (
    auth.uid() = vendor_id OR 
    auth.uid() = supplier_id
  );

-- Policy for inserting orders (vendors can create orders)
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = vendor_id
  );

-- Policy for deleting orders (only allow if needed)
CREATE POLICY "Users can delete their own orders" ON public.orders
  FOR DELETE USING (
    auth.uid() = vendor_id OR 
    auth.uid() = supplier_id
  );

-- Ensure the orders table has RLS enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY; 