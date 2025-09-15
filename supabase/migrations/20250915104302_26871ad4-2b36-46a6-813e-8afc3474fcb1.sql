-- Revert database from Farmer-Distributor-Retailer-Consumer back to Vendor-Supplier system
-- Fix dependency issues by dropping policies and constraints first

-- 1. Drop all existing RLS policies on orders and reviews
DROP POLICY IF EXISTS "Consumers can manage their own orders" ON public.orders;
DROP POLICY IF EXISTS "Retailers can view orders for their products" ON public.orders;
DROP POLICY IF EXISTS "Retailers can update orders for their products" ON public.orders;
DROP POLICY IF EXISTS "Order items follow order permissions" ON public.order_items;
DROP POLICY IF EXISTS "Users can view reviews about them or by them" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

-- 2. Drop dependent tables first
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.consumer_orders CASCADE;
DROP TABLE IF EXISTS public.batches CASCADE;
DROP TABLE IF EXISTS public.transfers CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.retailer_inventory CASCADE;
DROP TABLE IF EXISTS public.shipments CASCADE;

-- 3. Drop foreign key constraints that might interfere
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_consumer_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_retailer_id_fkey;

-- 4. Now safely update the orders table
ALTER TABLE public.orders DROP COLUMN IF EXISTS consumer_id CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS retailer_id CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS address_json CASCADE;

-- Ensure we have the vendor_id and supplier_id columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS vendor_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS supplier_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Add the stock_updated column that the code expects
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stock_updated BOOLEAN DEFAULT FALSE;

-- Update status constraint to include the statuses expected by the UI
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));

-- Add foreign key constraints for vendor-supplier system
ALTER TABLE public.orders ADD CONSTRAINT orders_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.users(id);

ALTER TABLE public.orders ADD CONSTRAINT orders_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES public.users(id);

ALTER TABLE public.orders ADD CONSTRAINT orders_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id);

-- 5. Update the reviews table to match vendor-supplier schema
ALTER TABLE public.reviews DROP COLUMN IF EXISTS from_user_id CASCADE;
ALTER TABLE public.reviews DROP COLUMN IF EXISTS to_user_id CASCADE;

-- Add the columns expected by the vendor-supplier system
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS vendor_id UUID;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS supplier_id UUID;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS order_id UUID;

-- Add foreign key constraints
ALTER TABLE public.reviews ADD CONSTRAINT reviews_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.users(id);

ALTER TABLE public.reviews ADD CONSTRAINT reviews_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES public.users(id);

ALTER TABLE public.reviews ADD CONSTRAINT reviews_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id);

-- 6. Update users table to only have vendor and supplier roles
UPDATE public.users SET role = 'vendor' WHERE role IN ('consumer', 'retailer', 'distributor');
UPDATE public.users SET role = 'supplier' WHERE role = 'farmer';

-- 7. Create vendor-supplier RLS policies for orders
CREATE POLICY "Vendors can view their orders" ON public.orders
FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Suppliers can view orders for their products" ON public.orders
FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Vendors can create orders" ON public.orders
FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Suppliers can update order status" ON public.orders
FOR UPDATE USING (supplier_id = auth.uid());

-- 8. Create vendor-supplier RLS policies for reviews
CREATE POLICY "Vendors can create reviews" ON public.reviews
FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Users can view reviews involving them" ON public.reviews
FOR SELECT USING (vendor_id = auth.uid() OR supplier_id = auth.uid());