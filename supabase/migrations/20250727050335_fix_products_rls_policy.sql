-- Fix RLS policies for products table
-- Enable RLS and create proper policies for product access

-- Re-enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;

-- Create policy to allow authenticated users to read all products
CREATE POLICY "Allow authenticated users to read products" ON public.products
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow suppliers to manage their own products
CREATE POLICY "Allow suppliers to manage their products" ON public.products
    FOR ALL
    TO authenticated
    USING (supplier_id = auth.uid())
    WITH CHECK (supplier_id = auth.uid());

-- Test the policies
DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.products;
    RAISE NOTICE 'Products accessible with new RLS policies: %', product_count;
END $$; 