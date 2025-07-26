-- Automatically update products to link to Viswas Co account
-- Run this in your Supabase SQL Editor

-- First, let's see what supplier accounts exist
SELECT 
  id,
  name,
  email,
  business_name,
  created_at
FROM public.users 
WHERE role = 'supplier'
ORDER BY created_at DESC;

-- Now let's see current product-supplier relationships
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.supplier_id,
  u.name as supplier_name,
  u.business_name as supplier_business_name,
  u.email as supplier_email
FROM public.products p
JOIN public.users u ON p.supplier_id = u.id
ORDER BY p.created_at DESC;

-- Update all products to link to the most recent supplier account (Viswas Co)
SELECT update_products_to_latest_supplier();

-- Verify the changes
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.supplier_id,
  u.name as supplier_name,
  u.business_name as supplier_business_name,
  u.email as supplier_email
FROM public.products p
JOIN public.users u ON p.supplier_id = u.id
ORDER BY p.created_at DESC;

-- Show the product-supplier relationships view
SELECT * FROM product_supplier_relationships; 