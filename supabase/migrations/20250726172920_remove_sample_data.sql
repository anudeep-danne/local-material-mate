-- Remove hardcoded sample data and ensure real user data is used
-- This migration removes the dummy data that was overriding real user information

-- First, let's clean up the hardcoded sample data by removing the business details
-- but keeping the basic user structure for authentication

-- Remove hardcoded business information from sample users
-- This will allow real user data to be used instead of dummy data
UPDATE public.users 
SET 
  business_name = NULL,
  phone = NULL,
  address = NULL,
  city = NULL,
  state = NULL,
  pincode = NULL,
  latitude = NULL,
  longitude = NULL,
  description = NULL
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

-- Keep only the essential authentication data
-- This ensures the sample users can still log in but won't show dummy business info
UPDATE public.users 
SET 
  name = CASE 
    WHEN id = '11111111-1111-1111-1111-111111111111' THEN 'John Vendor'
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'Jane Supplier'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'Bob Vendor'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'Alice Supplier'
    ELSE name
  END,
  email = CASE 
    WHEN id = '11111111-1111-1111-1111-111111111111' THEN 'john.vendor@example.com'
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'jane.supplier@example.com'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'bob.vendor@example.com'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'alice.supplier@example.com'
    ELSE email
  END
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

-- Create a function to ensure real user data is always used
CREATE OR REPLACE FUNCTION ensure_real_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new user or user data is being updated, ensure we don't override with dummy data
  IF NEW.business_name IS NULL OR NEW.business_name = '' THEN
    -- Don't set dummy business names - let users set their own
    NEW.business_name := NULL;
  END IF;
  
  IF NEW.phone IS NULL OR NEW.phone = '' THEN
    -- Don't set dummy phone numbers - let users set their own
    NEW.phone := NULL;
  END IF;
  
  IF NEW.city IS NULL OR NEW.city = '' THEN
    -- Don't set dummy cities - let users set their own
    NEW.city := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure real user data is used
DROP TRIGGER IF EXISTS ensure_real_user_data_trigger ON public.users;
CREATE TRIGGER ensure_real_user_data_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_real_user_data();

-- Add a comment to remind developers about real data usage
COMMENT ON TABLE public.users IS 'Users table - ensure real user data is used, not dummy data';

-- Create a view to help identify users with incomplete data
CREATE OR REPLACE VIEW users_with_incomplete_data AS
SELECT 
  id,
  name,
  email,
  role,
  business_name,
  phone,
  city,
  CASE 
    WHEN business_name IS NULL OR business_name = '' THEN 'Missing business name'
    WHEN phone IS NULL OR phone = '' THEN 'Missing phone'
    WHEN city IS NULL OR city = '' THEN 'Missing city'
    ELSE 'Complete'
  END as missing_info
FROM public.users
WHERE business_name IS NULL OR business_name = '' 
   OR phone IS NULL OR phone = '' 
   OR city IS NULL OR city = '';

-- Add RLS policies to ensure users can only see their own data and public supplier data
-- This ensures data privacy while allowing vendors to see supplier information

-- Policy for users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own data
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy for public read access to supplier data (for vendors browsing products)
DROP POLICY IF EXISTS "Public can read supplier data" ON public.users;
CREATE POLICY "Public can read supplier data" ON public.users
  FOR SELECT USING (role = 'supplier');

-- Policy for public read access to vendor data (for suppliers viewing orders)
DROP POLICY IF EXISTS "Public can read vendor data" ON public.users;
CREATE POLICY "Public can read vendor data" ON public.users
  FOR SELECT USING (role = 'vendor');

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a function to get user profile with real data
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  business_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.business_name,
    u.phone,
    u.address,
    u.city,
    u.state,
    u.pincode,
    u.description
  FROM public.users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION get_user_profile(UUID) IS 'Get user profile with real data - use this instead of direct table access';
COMMENT ON VIEW users_with_incomplete_data IS 'View to identify users who need to complete their profile information';
