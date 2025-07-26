-- Check current user data to see what's in the database
-- Run this in your Supabase SQL Editor

-- Check all users and their business information
SELECT 
  id,
  name,
  email,
  role,
  business_name,
  phone,
  city,
  state,
  created_at
FROM public.users 
WHERE role = 'supplier' OR role = 'vendor'
ORDER BY created_at DESC;

-- Check if there are any products and their supplier information
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

-- Check the users_with_incomplete_data view
SELECT * FROM users_with_incomplete_data; 