-- Complete fix for vendor data in orders
-- This migration removes all dummy data and ensures proper vendor linking

-- First, let's identify and remove any dummy vendor data
-- Remove users with generic names like "John Vendor", "Test Vendor", etc.
DELETE FROM public.users 
WHERE role = 'vendor' 
AND (
  name ILIKE '%vendor%' 
  OR name ILIKE '%test%' 
  OR name ILIKE '%john%' 
  OR name ILIKE '%dummy%'
  OR business_name ILIKE '%vendor%'
  OR business_name ILIKE '%test%'
  OR business_name ILIKE '%john%'
  OR business_name ILIKE '%dummy%'
);

-- Remove orders that are linked to non-existent vendors
DELETE FROM public.orders 
WHERE vendor_id NOT IN (SELECT id FROM public.users WHERE role = 'vendor');

-- Remove orders that are linked to non-existent suppliers
DELETE FROM public.orders 
WHERE supplier_id NOT IN (SELECT id FROM public.users WHERE role = 'supplier');

-- Remove orders that are linked to non-existent products
DELETE FROM public.orders 
WHERE product_id NOT IN (SELECT id FROM public.products);

-- Now let's ensure we have proper vendor accounts
-- Create a function to validate vendor data
CREATE OR REPLACE FUNCTION validate_vendor_data()
RETURNS TABLE (
  vendor_id UUID,
  vendor_name TEXT,
  vendor_email TEXT,
  vendor_business_name TEXT,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as vendor_id,
    u.name as vendor_name,
    u.email as vendor_email,
    u.business_name as vendor_business_name,
    CASE 
      WHEN u.name IS NOT NULL 
       AND u.name != '' 
       AND u.name NOT ILIKE '%vendor%'
       AND u.name NOT ILIKE '%test%'
       AND u.name NOT ILIKE '%john%'
       AND u.name NOT ILIKE '%dummy%'
       AND u.email IS NOT NULL
       AND u.email != ''
      THEN true
      ELSE false
    END as is_valid
  FROM public.users u
  WHERE u.role = 'vendor';
END;
$$ LANGUAGE plpgsql;

-- Create a function to get the most recent valid vendor
CREATE OR REPLACE FUNCTION get_most_recent_valid_vendor()
RETURNS UUID AS $$
DECLARE
  vendor_uuid UUID;
BEGIN
  SELECT u.id INTO vendor_uuid
  FROM public.users u
  WHERE u.role = 'vendor'
    AND u.name IS NOT NULL 
    AND u.name != '' 
    AND u.name NOT ILIKE '%vendor%'
    AND u.name NOT ILIKE '%test%'
    AND u.name NOT ILIKE '%john%'
    AND u.name NOT ILIKE '%dummy%'
    AND u.email IS NOT NULL
    AND u.email != ''
  ORDER BY u.created_at DESC
  LIMIT 1;
  
  RETURN vendor_uuid;
END;
$$ LANGUAGE plpgsql;

-- Update any remaining orders to use valid vendor accounts
UPDATE public.orders 
SET vendor_id = get_most_recent_valid_vendor()
WHERE vendor_id IN (
  SELECT u.id 
  FROM public.users u 
  WHERE u.role = 'vendor'
    AND (
      u.name IS NULL 
      OR u.name = '' 
      OR u.name ILIKE '%vendor%'
      OR u.name ILIKE '%test%'
      OR u.name ILIKE '%john%'
      OR u.name ILIKE '%dummy%'
      OR u.email IS NULL
      OR u.email = ''
    )
)
AND EXISTS (SELECT 1 FROM public.users WHERE role = 'vendor');

-- Add constraints to prevent future dummy data
ALTER TABLE public.users 
ADD CONSTRAINT check_vendor_name_not_generic 
CHECK (
  role != 'vendor' OR (
    name IS NOT NULL 
    AND name != '' 
    AND name NOT ILIKE '%vendor%'
    AND name NOT ILIKE '%test%'
    AND name NOT ILIKE '%john%'
    AND name NOT ILIKE '%dummy%'
    AND email IS NOT NULL
    AND email != ''
  )
);

-- Create a view for clean vendor data
CREATE OR REPLACE VIEW clean_vendor_orders AS
SELECT 
  o.id as order_id,
  o.vendor_id,
  o.supplier_id,
  o.product_id,
  o.quantity,
  o.total_amount,
  o.status,
  o.created_at as order_created_at,
  v.name as vendor_name,
  v.business_name as vendor_business_name,
  v.email as vendor_email,
  v.phone as vendor_phone,
  v.city as vendor_city,
  v.state as vendor_state,
  v.address as vendor_address,
  s.name as supplier_name,
  s.business_name as supplier_business_name,
  p.name as product_name,
  p.price as product_price
FROM public.orders o
JOIN public.users v ON o.vendor_id = v.id AND v.role = 'vendor'
JOIN public.users s ON o.supplier_id = s.id AND s.role = 'supplier'
JOIN public.products p ON o.product_id = p.id
WHERE v.name IS NOT NULL 
  AND v.name != '' 
  AND v.name NOT ILIKE '%vendor%'
  AND v.name NOT ILIKE '%test%'
  AND v.name NOT ILIKE '%john%'
  AND v.name NOT ILIKE '%dummy%'
  AND v.email IS NOT NULL
  AND v.email != '';

-- Add comments for documentation
COMMENT ON FUNCTION validate_vendor_data() IS 'Validates vendor data to ensure no dummy/generic data';
COMMENT ON FUNCTION get_most_recent_valid_vendor() IS 'Gets the most recent valid vendor account';
COMMENT ON VIEW clean_vendor_orders IS 'View showing only orders with valid vendor data';
COMMENT ON CONSTRAINT check_vendor_name_not_generic ON public.users IS 'Prevents creation of generic vendor accounts';

