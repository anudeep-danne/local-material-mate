-- Ensure test vendor exists for cart functionality
-- This migration creates the test vendor if it doesn't exist

-- Insert test vendor if it doesn't exist
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
  '11111111-1111-1111-1111-111111111111',
  'Viswas',
  'viswas@example.com',
  'vendor',
  'Viswas Fresh Foods',
  '+91-9876543210',
  '123 Fresh Street',
  'Mumbai',
  'Maharashtra',
  '400001',
  'Development vendor account for testing cart functionality',
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

-- Verify the vendor exists
SELECT 
  id,
  name,
  email,
  role,
  business_name,
  created_at
FROM public.users 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Add a comment to document this
COMMENT ON TABLE public.users IS 'Users table with test vendor account for development';
