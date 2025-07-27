-- Simple fix for vendor data in orders
-- This migration ensures all orders are linked to actual vendor accounts

-- First, let's see what we have
-- (This will be logged but not executed as part of the migration)

-- Update orders that have invalid vendor_id to use the most recent vendor
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
COMMENT ON TABLE public.orders IS 'Orders table with proper vendor and supplier relationships';

