-- Create real vendor accounts for testing without dummy data
-- This migration ensures we have proper vendor accounts for real-time functionality

-- Create a real vendor account for testing
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  business_name,
  phone,
  address,
  city,
  state,
  pincode,
  description,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Anudeep Raw Materials',
  'anudeep@rawmaterials.com',
  'vendor',
  'Anudeep Raw Materials Co.',
  '+91-9876543211',
  '456 Raw Materials Street',
  'Bangalore',
  'Karnataka',
  '560001',
  'Professional raw materials supplier with real-time order tracking',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  business_name = EXCLUDED.business_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  pincode = EXCLUDED.pincode,
  description = EXCLUDED.description;

-- Create another real vendor account
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  business_name,
  phone,
  address,
  city,
  state,
  pincode,
  description,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Premium Materials Ltd',
  'info@premiummaterials.com',
  'vendor',
  'Premium Materials Limited',
  '+91-9876543212',
  '789 Premium Street',
  'Mumbai',
  'Maharashtra',
  '400002',
  'Premium quality raw materials with fast delivery',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  business_name = EXCLUDED.business_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  pincode = EXCLUDED.pincode,
  description = EXCLUDED.description;

-- Clean up any existing cart data that might be causing issues
DELETE FROM public.cart WHERE vendor_id NOT IN (
  SELECT id FROM public.users WHERE role = 'vendor'
);

-- Ensure all cart items have valid vendor and product references
DELETE FROM public.cart WHERE vendor_id IS NULL OR product_id IS NULL;

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'Users table with real vendor accounts for testing';

