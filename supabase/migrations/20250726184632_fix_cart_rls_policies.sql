-- Fix cart RLS policies for development
-- This migration allows cart operations without authentication for development

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Vendors can view their own cart items" ON public.cart;
DROP POLICY IF EXISTS "Vendors can insert their own cart items" ON public.cart;
DROP POLICY IF EXISTS "Vendors can update their own cart items" ON public.cart;
DROP POLICY IF EXISTS "Vendors can delete their own cart items" ON public.cart;

-- Create new policies that allow all operations for development
-- These policies will work with hardcoded vendor IDs

-- Allow all cart operations for development
CREATE POLICY "Allow all cart operations for development" ON public.cart
  FOR ALL USING (true) WITH CHECK (true);

-- Alternative: Create specific policies for each operation
-- CREATE POLICY "Allow cart select for development" ON public.cart
--   FOR SELECT USING (true);

-- CREATE POLICY "Allow cart insert for development" ON public.cart
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow cart update for development" ON public.cart
--   FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow cart delete for development" ON public.cart
--   FOR DELETE USING (true);

-- Add a comment to document this is for development
COMMENT ON POLICY "Allow all cart operations for development" ON public.cart IS 'Development policy - allows all cart operations without authentication';
