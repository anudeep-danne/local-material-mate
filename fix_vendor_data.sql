-- Fix vendor data in orders
-- This script checks and fixes vendor data issues in the orders table

-- First, let's see what vendor data we currently have in orders
SELECT 
  o.id as order_id,
  o.vendor_id,
  v.name as vendor_name,
  v.business_name as vendor_business_name,
  v.email as vendor_email,
  v.phone as vendor_phone,
  v.city as vendor_city,
  v.state as vendor_state,
  v.role as vendor_role
FROM public.orders o
LEFT JOIN public.users v ON o.vendor_id = v.id
ORDER BY o.created_at DESC;

-- Check if there are any orders with missing or invalid vendor_id
SELECT 
  COUNT(*) as orders_with_invalid_vendor,
  COUNT(CASE WHEN v.id IS NULL THEN 1 END) as orders_with_null_vendor,
  COUNT(CASE WHEN v.role != 'vendor' THEN 1 END) as orders_with_non_vendor
FROM public.orders o
LEFT JOIN public.users v ON o.vendor_id = v.id;

-- Get the most recent vendor account
SELECT 
  id,
  name,
  business_name,
  email,
  phone,
  city,
  state,
  created_at
FROM public.users 
WHERE role = 'vendor' 
ORDER BY created_at DESC 
LIMIT 1;

-- Update orders that have invalid vendor_id to use the most recent vendor
UPDATE public.orders 
SET vendor_id = (
  SELECT u.id 
  FROM public.users u 
  WHERE u.role = 'vendor' 
  ORDER BY u.created_at DESC 
  LIMIT 1
)
WHERE vendor_id NOT IN (
  SELECT id FROM public.users WHERE role = 'vendor'
)
AND EXISTS (SELECT 1 FROM public.users WHERE role = 'vendor');

-- Verify the fix
SELECT 
  o.id as order_id,
  o.vendor_id,
  v.name as vendor_name,
  v.business_name as vendor_business_name,
  v.email as vendor_email,
  v.phone as vendor_phone,
  v.city as vendor_city,
  v.state as vendor_state,
  v.role as vendor_role
FROM public.orders o
LEFT JOIN public.users v ON o.vendor_id = v.id
ORDER BY o.created_at DESC; 