-- Drop the constraint first
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Clean up the invalid role data first
UPDATE public.users SET role = 'distributor' WHERE role = 'vendor' OR role = 'Vendor bazaar';
UPDATE public.users SET role = 'farmer' WHERE role = 'supplier';

-- Now add the constraint
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('farmer', 'distributor', 'retailer', 'consumer'));

-- Add new fields to users table for extended profiles
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fleet_size INTEGER;

-- Create batches table for farmers
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  harvest_date DATE NOT NULL,
  price_per_kg DECIMAL NOT NULL,
  remaining_quantity DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Partially Sold', 'Fully Sold')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transfers table for batch movements
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  price_per_kg DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('farmer_to_distributor', 'distributor_to_retailer')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'In Transit', 'Delivered')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offers table for distributor offers to farmers
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  distributor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  offered_price_per_kg DECIMAL NOT NULL,
  total_offer_amount DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Expired')),
  notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create retailer inventory table
CREATE TABLE IF NOT EXISTS public.retailer_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  retail_price_per_kg DECIMAL NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consumer orders table
CREATE TABLE IF NOT EXISTS public.consumer_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES public.retailer_inventory(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Packed', 'Delivered', 'Cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipments table for tracking deliveries
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id UUID NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
  distributor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vehicle_number TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  departure_time TIMESTAMP WITH TIME ZONE,
  expected_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'Preparing' CHECK (status IN ('Preparing', 'In Transit', 'Delivered', 'Delayed')),
  tracking_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for batches
CREATE POLICY "Farmers can manage their own batches" ON public.batches
  FOR ALL USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "All authenticated users can view available batches" ON public.batches
  FOR SELECT USING (true);

-- Create RLS policies for transfers
CREATE POLICY "Users can view their own transfers" ON public.transfers
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create transfers they are involved in" ON public.transfers
  FOR INSERT WITH CHECK (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can update their own transfers" ON public.transfers
  FOR UPDATE USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Create RLS policies for offers
CREATE POLICY "Distributors can manage their own offers" ON public.offers
  FOR ALL USING (distributor_id = auth.uid())
  WITH CHECK (distributor_id = auth.uid());

CREATE POLICY "Farmers can view offers for their batches" ON public.offers
  FOR SELECT USING (farmer_id = auth.uid());

CREATE POLICY "Farmers can update offers for their batches" ON public.offers
  FOR UPDATE USING (farmer_id = auth.uid());

-- Create RLS policies for retailer inventory
CREATE POLICY "Retailers can manage their own inventory" ON public.retailer_inventory
  FOR ALL USING (retailer_id = auth.uid())
  WITH CHECK (retailer_id = auth.uid());

CREATE POLICY "All authenticated users can view retailer inventory" ON public.retailer_inventory
  FOR SELECT USING (true);

-- Create RLS policies for consumer orders
CREATE POLICY "Consumers can manage their own orders" ON public.consumer_orders
  FOR ALL USING (consumer_id = auth.uid())
  WITH CHECK (consumer_id = auth.uid());

CREATE POLICY "Retailers can view orders for their products" ON public.consumer_orders
  FOR SELECT USING (retailer_id = auth.uid());

CREATE POLICY "Retailers can update orders for their products" ON public.consumer_orders
  FOR UPDATE USING (retailer_id = auth.uid());

-- Create RLS policies for shipments
CREATE POLICY "Distributors can manage their own shipments" ON public.shipments
  FOR ALL USING (distributor_id = auth.uid())
  WITH CHECK (distributor_id = auth.uid());

CREATE POLICY "All users can view shipments they are involved in" ON public.shipments
  FOR SELECT USING (
    distributor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.transfers t 
      WHERE t.id = shipments.transfer_id 
      AND (t.from_user_id = auth.uid() OR t.to_user_id = auth.uid())
    )
  );

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transfers_updated_at
  BEFORE UPDATE ON public.transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retailer_inventory_updated_at
  BEFORE UPDATE ON public.retailer_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consumer_orders_updated_at
  BEFORE UPDATE ON public.consumer_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update batch remaining quantity
CREATE OR REPLACE FUNCTION public.update_batch_remaining_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the batch remaining quantity based on confirmed transfers
  UPDATE public.batches 
  SET remaining_quantity = quantity - (
    SELECT COALESCE(SUM(t.quantity), 0)
    FROM public.transfers t
    WHERE t.batch_id = NEW.batch_id 
    AND t.status IN ('Confirmed', 'In Transit', 'Delivered')
  ),
  status = CASE 
    WHEN (quantity - (
      SELECT COALESCE(SUM(t.quantity), 0)
      FROM public.transfers t
      WHERE t.batch_id = NEW.batch_id 
      AND t.status IN ('Confirmed', 'In Transit', 'Delivered')
    )) <= 0 THEN 'Fully Sold'
    WHEN (quantity - (
      SELECT COALESCE(SUM(t.quantity), 0)
      FROM public.transfers t
      WHERE t.batch_id = NEW.batch_id 
      AND t.status IN ('Confirmed', 'In Transit', 'Delivered')
    )) < quantity THEN 'Partially Sold'
    ELSE 'Available'
  END,
  updated_at = now()
  WHERE id = NEW.batch_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_batch_quantity_on_transfer
  AFTER INSERT OR UPDATE ON public.transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_batch_remaining_quantity();