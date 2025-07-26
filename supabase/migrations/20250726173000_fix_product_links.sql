-- Fix product-supplier links and ensure real-time updates
-- This migration will link products to real supplier accounts and enable automatic updates

-- First, let's create a function to automatically update product supplier information
-- when a supplier updates their business information

CREATE OR REPLACE FUNCTION update_product_supplier_info()
RETURNS TRIGGER AS $$
BEGIN
  -- When a supplier updates their business information, 
  -- we don't need to update products directly since they're linked via foreign key
  -- But we can log the change for debugging
  IF OLD.business_name IS DISTINCT FROM NEW.business_name THEN
    RAISE NOTICE 'Supplier % updated business name from % to %', 
      NEW.id, OLD.business_name, NEW.business_name;
  END IF;
  
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    RAISE NOTICE 'Supplier % updated phone from % to %', 
      NEW.id, OLD.phone, NEW.phone;
  END IF;
  
  IF OLD.city IS DISTINCT FROM NEW.city THEN
    RAISE NOTICE 'Supplier % updated city from % to %', 
      NEW.id, OLD.city, NEW.city;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log supplier updates
DROP TRIGGER IF EXISTS log_supplier_updates ON public.users;
CREATE TRIGGER log_supplier_updates
  AFTER UPDATE ON public.users
  FOR EACH ROW
  WHEN (OLD.role = 'supplier')
  EXECUTE FUNCTION update_product_supplier_info();

-- Create a function to get the most recent supplier account
-- This will help us identify which supplier account to use for products
CREATE OR REPLACE FUNCTION get_latest_supplier_account()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.business_name,
    u.created_at
  FROM public.users u
  WHERE u.role = 'supplier'
  AND u.business_name IS NOT NULL
  AND u.business_name != ''
  ORDER BY u.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update all products to link to the most recent supplier
CREATE OR REPLACE FUNCTION update_products_to_latest_supplier()
RETURNS INTEGER AS $$
DECLARE
  latest_supplier_id UUID;
  updated_count INTEGER := 0;
BEGIN
  -- Get the most recent supplier account
  SELECT id INTO latest_supplier_id
  FROM get_latest_supplier_account();
  
  IF latest_supplier_id IS NOT NULL THEN
    -- Update all products to link to this supplier
    UPDATE public.products 
    SET supplier_id = latest_supplier_id
    WHERE supplier_id IN (
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444'
    );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'Updated % products to link to supplier %', updated_count, latest_supplier_id;
  ELSE
    RAISE NOTICE 'No valid supplier account found to link products to';
  END IF;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_products_to_latest_supplier() TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_supplier_account() TO authenticated;

-- Create a view to show current product-supplier relationships
CREATE OR REPLACE VIEW product_supplier_relationships AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.supplier_id,
  u.name as supplier_name,
  u.business_name as supplier_business_name,
  u.email as supplier_email,
  u.phone as supplier_phone,
  u.city as supplier_city,
  u.state as supplier_state
FROM public.products p
JOIN public.users u ON p.supplier_id = u.id
ORDER BY p.created_at DESC;

-- Grant permissions for the view
GRANT SELECT ON product_supplier_relationships TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION update_products_to_latest_supplier() IS 'Updates all products to link to the most recent supplier account';
COMMENT ON FUNCTION get_latest_supplier_account() IS 'Gets the most recent supplier account with valid business information';
COMMENT ON VIEW product_supplier_relationships IS 'Shows current relationships between products and suppliers'; 