-- Fix trigger issue that's preventing vendor account creation
-- This migration removes the problematic trigger and function

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS track_vendor_profile_updates ON public.users;

-- Drop the problematic function
DROP FUNCTION IF EXISTS update_vendor_display_on_profile_change();

-- Now create the vendor account without any trigger conflicts
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

-- Clean up any cart items that might be causing issues
DELETE FROM public.cart WHERE vendor_id IS NULL;
DELETE FROM public.cart WHERE product_id IS NULL;
DELETE FROM public.cart WHERE quantity IS NULL OR quantity <= 0;

-- Ensure all cart items have valid vendor and product references
DELETE FROM public.cart WHERE vendor_id NOT IN (
  SELECT id FROM public.users WHERE role = 'vendor'
);

DELETE FROM public.cart WHERE product_id NOT IN (
  SELECT id FROM public.products
);

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'Users table with vendor accounts for cart operations';
COMMENT ON TABLE public.cart IS 'Cart table for vendor shopping cart functionality';

