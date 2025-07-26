-- Check vendor data after migration
-- This script will show us the current state of vendor data

-- Check all vendor accounts
SELECT 
  id,
  name,
  business_name,
  email,
  phone,
  city,
  state,
  created_at,
  CASE 
    WHEN name ILIKE '%vendor%' OR name ILIKE '%test%' OR name ILIKE '%john%' OR name ILIKE '%dummy%'
    THEN 'DUMMY'
    ELSE 'VALID'
  END as status
FROM public.users 
WHERE role = 'vendor'
ORDER BY created_at DESC;

-- Check orders and their vendor data
SELECT 
  o.id as order_id,
  o.vendor_id,
  o.supplier_id,
  o.product_id,
  o.status,
  o.created_at as order_created_at,
  v.name as vendor_name,
  v.business_name as vendor_business_name,
  v.email as vendor_email,
  s.name as supplier_name,
  p.name as product_name,
  CASE 
    WHEN v.name ILIKE '%vendor%' OR v.name ILIKE '%test%' OR v.name ILIKE '%john%' OR v.name ILIKE '%dummy%'
    THEN 'DUMMY_VENDOR'
    ELSE 'VALID_VENDOR'
  END as vendor_status
FROM public.orders o
LEFT JOIN public.users v ON o.vendor_id = v.id
LEFT JOIN public.users s ON o.supplier_id = s.id
LEFT JOIN public.products p ON o.product_id = p.id
ORDER BY o.created_at DESC;

-- Count orders by vendor status
SELECT 
  CASE 
    WHEN v.name ILIKE '%vendor%' OR v.name ILIKE '%test%' OR v.name ILIKE '%john%' OR v.name ILIKE '%dummy%'
    THEN 'DUMMY_VENDOR'
    ELSE 'VALID_VENDOR'
  END as vendor_status,
  COUNT(*) as order_count
FROM public.orders o
LEFT JOIN public.users v ON o.vendor_id = v.id
GROUP BY vendor_status;

-- Show the most recent valid vendor
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
  AND name IS NOT NULL 
  AND name != '' 
  AND name NOT ILIKE '%vendor%'
  AND name NOT ILIKE '%test%'
  AND name NOT ILIKE '%john%'
  AND name NOT ILIKE '%dummy%'
  AND email IS NOT NULL
  AND email != ''
ORDER BY created_at DESC 
LIMIT 5; 