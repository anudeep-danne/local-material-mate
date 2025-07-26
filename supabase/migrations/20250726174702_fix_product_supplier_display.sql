-- Fix Product Supplier Display
-- This migration ensures each product shows its actual creator's information
-- Instead of linking all products to one supplier

-- First, let's see the current state of products and their suppliers
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

-- The issue is that sample products were created with incomplete supplier data
-- We need to ensure that when suppliers create products, their real information is displayed
-- Let's create a function to get complete supplier information for display

CREATE OR REPLACE FUNCTION get_supplier_display_info(supplier_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  business_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  display_name TEXT,
  display_phone TEXT,
  display_location TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.business_name,
    u.phone,
    u.address,
    u.city,
    u.state,
    u.pincode,
    -- Display name: business_name if available, otherwise name
    COALESCE(u.business_name, u.name, 'Business Name Not Set') as display_name,
    -- Display phone: actual phone if available, otherwise placeholder
    COALESCE(u.phone, 'Phone Not Set') as display_phone,
    -- Display location: city, state if available, otherwise placeholder
    CASE 
      WHEN u.city IS NOT NULL AND u.state IS NOT NULL THEN u.city || ', ' || u.state
      WHEN u.city IS NOT NULL THEN u.city
      WHEN u.state IS NOT NULL THEN u.state
      ELSE 'Location Not Set'
    END as display_location
  FROM public.users u
  WHERE u.id = supplier_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_supplier_display_info(UUID) TO authenticated;

-- Create a view for product-supplier relationships with proper display info
CREATE OR REPLACE VIEW product_supplier_display AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.price as product_price,
  p.category as product_category,
  p.image_url as product_image,
  p.stock as product_stock,
  p.created_at as product_created_at,
  p.supplier_id,
  -- Supplier display information
  COALESCE(u.business_name, u.name, 'Business Name Not Set') as supplier_display_name,
  COALESCE(u.phone, 'Phone Not Set') as supplier_display_phone,
  CASE 
    WHEN u.city IS NOT NULL AND u.state IS NOT NULL THEN u.city || ', ' || u.state
    WHEN u.city IS NOT NULL THEN u.city
    WHEN u.state IS NOT NULL THEN u.state
    ELSE 'Location Not Set'
  END as supplier_display_location,
  -- Full supplier details
  u.name as supplier_name,
  u.email as supplier_email,
  u.business_name as supplier_business_name,
  u.phone as supplier_phone,
  u.address as supplier_address,
  u.city as supplier_city,
  u.state as supplier_state,
  u.pincode as supplier_pincode,
  u.created_at as supplier_created_at
FROM public.products p
JOIN public.users u ON p.supplier_id = u.id
WHERE u.role = 'supplier';

-- Grant select permission on the view
GRANT SELECT ON product_supplier_display TO authenticated;

-- Create a function to update supplier display information when supplier profile changes
CREATE OR REPLACE FUNCTION update_supplier_display_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a supplier updates their profile
  -- The view will automatically reflect the changes since it's based on the users table
  -- We just need to ensure the trigger exists for future profile updates
  
  -- Log the update for debugging
  INSERT INTO public.supplier_profile_updates (supplier_id, updated_at, old_business_name, new_business_name)
  VALUES (
    NEW.id,
    NOW(),
    OLD.business_name,
    NEW.business_name
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a table to track supplier profile updates (for debugging)
CREATE TABLE IF NOT EXISTS public.supplier_profile_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  old_business_name TEXT,
  new_business_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions on the tracking table
GRANT SELECT, INSERT ON public.supplier_profile_updates TO authenticated;

-- Create trigger to track supplier profile updates
DROP TRIGGER IF EXISTS track_supplier_profile_updates ON public.users;
CREATE TRIGGER track_supplier_profile_updates
  AFTER UPDATE ON public.users
  FOR EACH ROW
  WHEN (OLD.role = 'supplier' AND (OLD.business_name IS DISTINCT FROM NEW.business_name OR 
                                   OLD.phone IS DISTINCT FROM NEW.phone OR 
                                   OLD.city IS DISTINCT FROM NEW.city OR 
                                   OLD.state IS DISTINCT FROM NEW.state))
  EXECUTE FUNCTION update_supplier_display_on_profile_change();

-- Show the new view with proper display information
SELECT 
  product_id,
  product_name,
  supplier_display_name,
  supplier_display_phone,
  supplier_display_location,
  supplier_email
FROM product_supplier_display
ORDER BY product_created_at DESC;

-- Test the function with a sample supplier
SELECT * FROM get_supplier_display_info(
  (SELECT id FROM public.users WHERE role = 'supplier' LIMIT 1)
);
