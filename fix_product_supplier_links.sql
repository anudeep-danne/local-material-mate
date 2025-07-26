-- Fix product-supplier links and ensure real user data is used
-- This script will help resolve the issue where products show old supplier names

-- First, let's see what products exist and their current supplier links
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

-- If you want to update products to link to your new supplier account (Viswas Co)
-- Replace 'YOUR_NEW_SUPPLIER_ID' with the actual ID of your Viswas Co account
-- Uncomment and run the following if needed:

/*
UPDATE public.products 
SET supplier_id = 'YOUR_NEW_SUPPLIER_ID'
WHERE supplier_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
*/

-- Alternative: If you want to delete old sample products and create new ones
-- Uncomment the following if you want to start fresh:

/*
-- Delete old sample products
DELETE FROM public.products 
WHERE supplier_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

-- Then you can add new products linked to your real supplier account
*/ 