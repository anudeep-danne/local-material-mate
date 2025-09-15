-- Fix critical security issues: Enable RLS on missing tables and fix views

-- Enable RLS on tables that don't have it
ALTER TABLE public.stock_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_profile_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for stock_changes table
CREATE POLICY "Only system can access stock changes" ON public.stock_changes
FOR ALL USING (false);

-- Create policies for supplier_profile_updates table  
CREATE POLICY "Suppliers can view their own profile updates" ON public.supplier_profile_updates
FOR SELECT USING (supplier_id = auth.uid());

-- Drop and recreate views without SECURITY DEFINER to fix security warnings
DROP VIEW IF EXISTS public.product_supplier_relationships CASCADE;
DROP VIEW IF EXISTS public.cart_items_with_details CASCADE;
DROP VIEW IF EXISTS public.product_supplier_display CASCADE;

-- Recreate views without SECURITY DEFINER
CREATE VIEW public.product_supplier_relationships AS
SELECT 
  p.id as product_id,
  p.supplier_id,
  p.name as product_name,
  u.name as supplier_name,
  u.business_name as supplier_business_name,
  u.email as supplier_email,
  u.phone as supplier_phone,
  u.city as supplier_city,
  u.state as supplier_state
FROM public.products p
LEFT JOIN public.users u ON p.supplier_id = u.id;

CREATE VIEW public.cart_items_with_details AS
SELECT 
  c.id as cart_id,
  c.vendor_id,
  c.product_id,
  c.quantity,
  c.created_at,
  c.updated_at,
  p.name as product_name,
  p.price as product_price,
  p.image_url as product_image,
  p.category as product_category,
  p.stock as product_stock,
  (c.quantity * p.price) as item_total,
  u.name as supplier_name,
  u.business_name as supplier_business_name,
  u.city as supplier_city,
  u.state as supplier_state,
  u.phone as supplier_phone
FROM public.cart c
JOIN public.products p ON c.product_id = p.id
JOIN public.users u ON p.supplier_id = u.id;

CREATE VIEW public.product_supplier_display AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.category as product_category,
  p.price as product_price,
  p.stock as product_stock,
  p.image_url as product_image,
  p.created_at as product_created_at,
  p.supplier_id,
  u.name as supplier_name,
  u.email as supplier_email,
  u.business_name as supplier_business_name,
  u.phone as supplier_phone,
  u.address as supplier_address,
  u.city as supplier_city,
  u.state as supplier_state,
  u.pincode as supplier_pincode,
  u.created_at as supplier_created_at,
  COALESCE(u.business_name, u.name, 'Business Name Not Set') as supplier_display_name,
  COALESCE(u.phone, 'Phone Not Set') as supplier_display_phone,
  CASE 
    WHEN u.city IS NOT NULL AND u.state IS NOT NULL THEN u.city || ', ' || u.state
    WHEN u.city IS NOT NULL THEN u.city
    WHEN u.state IS NOT NULL THEN u.state
    ELSE 'Location Not Set'
  END as supplier_display_location
FROM public.products p
LEFT JOIN public.users u ON p.supplier_id = u.id;