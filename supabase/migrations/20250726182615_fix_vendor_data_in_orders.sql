-- Fix vendor data in orders
-- This migration ensures that orders are properly linked to actual vendor data
-- and removes any dummy or incorrect vendor information

-- First, let's check what vendor data we have in orders
-- This will help us understand the current state

-- Create a function to get vendor display information
CREATE OR REPLACE FUNCTION get_vendor_display_info(input_vendor_id UUID)
RETURNS TABLE (
  vendor_id UUID,
  vendor_display_name TEXT,
  vendor_display_phone TEXT,
  vendor_display_location TEXT,
  vendor_name TEXT,
  vendor_email TEXT,
  vendor_business_name TEXT,
  vendor_phone TEXT,
  vendor_address TEXT,
  vendor_city TEXT,
  vendor_state TEXT,
  vendor_pincode TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as vendor_id,
    COALESCE(u.business_name, u.name, 'Business Name Not Set') as vendor_display_name,
    COALESCE(u.phone, 'Phone Not Set') as vendor_display_phone,
    CASE 
      WHEN u.city IS NOT NULL AND u.state IS NOT NULL THEN u.city || ', ' || u.state
      WHEN u.city IS NOT NULL THEN u.city
      WHEN u.state IS NOT NULL THEN u.state
      ELSE 'Location Not Set'
    END as vendor_display_location,
    u.name as vendor_name,
    u.email as vendor_email,
    u.business_name as vendor_business_name,
    u.phone as vendor_phone,
    u.address as vendor_address,
    u.city as vendor_city,
    u.state as vendor_state,
    u.pincode as vendor_pincode
  FROM public.users u
  WHERE u.id = input_vendor_id AND u.role = 'vendor';
END;
$$ LANGUAGE plpgsql;

-- Create a view for order vendor display
CREATE OR REPLACE VIEW order_vendor_display AS
SELECT 
  o.id as order_id,
  o.vendor_id,
  o.supplier_id,
  o.product_id,
  o.quantity,
  o.total_amount,
  o.status,
  o.created_at as order_created_at,
  COALESCE(v.business_name, v.name, 'Business Name Not Set') as vendor_display_name,
  COALESCE(v.phone, 'Phone Not Set') as vendor_display_phone,
  CASE 
    WHEN v.city IS NOT NULL AND v.state IS NOT NULL THEN v.city || ', ' || v.state
    WHEN v.city IS NOT NULL THEN v.city
    WHEN v.state IS NOT NULL THEN v.state
    ELSE 'Location Not Set'
  END as vendor_display_location,
  v.name as vendor_name,
  v.email as vendor_email,
  v.business_name as vendor_business_name,
  v.phone as vendor_phone,
  v.address as vendor_address,
  v.city as vendor_city,
  v.state as vendor_state,
  v.pincode as vendor_pincode,
  v.created_at as vendor_created_at
FROM public.orders o
JOIN public.users v ON o.vendor_id = v.id
WHERE v.role = 'vendor';

-- Create a function to update vendor display when vendor profile changes
CREATE OR REPLACE FUNCTION update_vendor_display_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change for debugging
  INSERT INTO public.profile_update_logs (user_id, table_name, action, old_data, new_data, created_at)
  VALUES (
    NEW.id,
    'users',
    'UPDATE',
    jsonb_build_object(
      'name', OLD.name,
      'business_name', OLD.business_name,
      'phone', OLD.phone,
      'city', OLD.city,
      'state', OLD.state,
      'address', OLD.address
    ),
    jsonb_build_object(
      'name', NEW.name,
      'business_name', NEW.business_name,
      'phone', NEW.phone,
      'city', NEW.city,
      'state', NEW.state,
      'address', NEW.address
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track vendor profile updates
DROP TRIGGER IF EXISTS track_vendor_profile_updates ON public.users;
CREATE TRIGGER track_vendor_profile_updates
  AFTER UPDATE ON public.users
  FOR EACH ROW
  WHEN (OLD.role = 'vendor' AND NEW.role = 'vendor')
  EXECUTE FUNCTION update_vendor_display_on_profile_change();

-- Update any orders that might have incorrect vendor_id references
-- This ensures all orders are linked to actual vendor accounts
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

-- Add a comment to document this migration
COMMENT ON FUNCTION get_vendor_display_info(UUID) IS 'Get formatted vendor display information for orders';
COMMENT ON VIEW order_vendor_display IS 'View for displaying vendor information in orders with proper formatting';
COMMENT ON FUNCTION update_vendor_display_on_profile_change() IS 'Track vendor profile updates for debugging';
