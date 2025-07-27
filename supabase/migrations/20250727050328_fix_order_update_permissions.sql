-- Fix order update permissions to ensure status updates work properly
-- This migration ensures that suppliers and vendors can update their orders

-- First, let's check and fix the RLS policies for the orders table
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all operations for testing" ON public.orders;

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

-- Also ensure all required columns exist and have proper constraints
-- Check if accepted_by column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'accepted_by') THEN
        ALTER TABLE public.orders ADD COLUMN accepted_by TEXT CHECK (accepted_by IN ('supplier'));
    END IF;
END $$;

-- Check if cancelled_by column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'cancelled_by') THEN
        ALTER TABLE public.orders ADD COLUMN cancelled_by TEXT CHECK (cancelled_by IN ('vendor', 'supplier'));
    END IF;
END $$;

-- Ensure updated_at column exists and has a trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
        ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create or replace the trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON public.orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON public.orders(updated_at); 