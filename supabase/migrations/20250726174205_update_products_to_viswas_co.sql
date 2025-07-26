-- Update products to link to Viswas Co account
-- This migration will fix the "Kumar Vegetables" issue

-- First, let's see what supplier accounts exist
-- This will help us identify the Viswas Co account
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
-- This will show us which products are linked to which suppliers
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
-- This function will automatically find the most recent supplier account and link products to it
SELECT update_products_to_latest_supplier();

-- Verify the changes
-- This will show us the updated product-supplier relationships
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
-- This view provides a comprehensive overview of all relationships
SELECT * FROM product_supplier_relationships;
