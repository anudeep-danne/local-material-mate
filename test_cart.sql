-- Test cart functionality
-- This script will help us verify that the cart is working properly

-- Check if the cart table exists and has the right structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cart'
ORDER BY ordinal_position;

-- Check current cart items for the test vendor
SELECT 
  c.id as cart_id,
  c.vendor_id,
  c.product_id,
  c.quantity,
  c.created_at,
  p.name as product_name,
  p.price as product_price,
  u.name as vendor_name
FROM public.cart c
JOIN public.products p ON c.product_id = p.id
JOIN public.users u ON c.vendor_id = u.id
WHERE c.vendor_id = '11111111-1111-1111-1111-111111111111'
ORDER BY c.created_at DESC;

-- Check if there are any products available to add to cart
SELECT 
  id,
  name,
  price,
  category,
  supplier_id
FROM public.products
WHERE supplier_id IN (
  SELECT id FROM public.users WHERE role = 'supplier'
)
LIMIT 5;

-- Check if the test vendor exists
SELECT 
  id,
  name,
  email,
  role,
  created_at
FROM public.users
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Count total cart items for the test vendor
SELECT 
  COUNT(*) as total_cart_items,
  SUM(quantity) as total_quantity
FROM public.cart
WHERE vendor_id = '11111111-1111-1111-1111-111111111111'; 