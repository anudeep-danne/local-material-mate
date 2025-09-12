-- First, update the existing users table to match requirements
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_json JSONB DEFAULT '{}';

-- Create updated batches table with proper supply chain structure
DROP TABLE IF EXISTS public.batches CASCADE;
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  total_quantity_kg NUMERIC NOT NULL CHECK (total_quantity_kg > 0),
  available_quantity_kg NUMERIC NOT NULL CHECK (available_quantity_kg >= 0),
  price_per_kg NUMERIC NOT NULL CHECK (price_per_kg > 0),
  harvest_date DATE NOT NULL,
  location TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}',
  parent_batch_id UUID REFERENCES public.batches(id),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Partial', 'Sold', 'Expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transfers table for supply chain tracking
DROP TABLE IF EXISTS public.transfers CASCADE;
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('farmer_to_distributor', 'distributor_to_retailer')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory table for retailers
DROP TABLE IF EXISTS public.inventory CASCADE;
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  quantity_available NUMERIC NOT NULL CHECK (quantity_available >= 0),
  retail_price_per_kg NUMERIC NOT NULL CHECK (retail_price_per_kg > 0),
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update orders table for consumer orders
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  address_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_items table
DROP TABLE IF EXISTS public.order_items CASCADE;
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price_per_kg NUMERIC NOT NULL CHECK (price_per_kg > 0)
);

-- Update offers table for supply chain
DROP TABLE IF EXISTS public.offers CASCADE;
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  qty_offered NUMERIC NOT NULL CHECK (qty_offered > 0),
  price_offered NUMERIC NOT NULL CHECK (price_offered > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update reviews table to be more generic
DROP TABLE IF EXISTS public.reviews CASCADE;
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batches
CREATE POLICY "Farmers can manage their own batches" ON public.batches
  FOR ALL USING (farmer_id = auth.uid());

CREATE POLICY "All authenticated users can view available batches" ON public.batches
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for transfers
CREATE POLICY "Users can view transfers they are involved in" ON public.transfers
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create transfers from themselves" ON public.transfers
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update transfers they are involved in" ON public.transfers
  FOR UPDATE USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- RLS Policies for inventory
CREATE POLICY "Retailers can manage their own inventory" ON public.inventory
  FOR ALL USING (retailer_id = auth.uid());

CREATE POLICY "All authenticated users can view inventory" ON public.inventory
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for orders
CREATE POLICY "Consumers can manage their own orders" ON public.orders
  FOR ALL USING (consumer_id = auth.uid());

CREATE POLICY "Retailers can view orders for their products" ON public.orders
  FOR SELECT USING (retailer_id = auth.uid());

CREATE POLICY "Retailers can update orders for their products" ON public.orders
  FOR UPDATE USING (retailer_id = auth.uid());

-- RLS Policies for order_items
CREATE POLICY "Order items follow order permissions" ON public.order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id 
      AND (o.consumer_id = auth.uid() OR o.retailer_id = auth.uid())
    )
  );

-- RLS Policies for offers
CREATE POLICY "Users can manage offers they make" ON public.offers
  FOR ALL USING (maker_id = auth.uid());

CREATE POLICY "Batch owners can view offers for their batches" ON public.offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batches b 
      WHERE b.id = target_batch_id 
      AND b.farmer_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can view reviews about them or by them" ON public.reviews
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Create database functions for atomic operations

-- Function to buy batch (distributor purchases from farmer)
CREATE OR REPLACE FUNCTION public.buy_batch(
  p_batch_id UUID,
  p_buyer_id UUID,
  p_quantity NUMERIC,
  p_price_offered NUMERIC
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available_qty NUMERIC;
  v_farmer_id UUID;
  v_new_batch_id UUID;
  v_transfer_id UUID;
BEGIN
  -- Lock the batch row and check availability
  SELECT available_quantity_kg, farmer_id INTO v_available_qty, v_farmer_id
  FROM public.batches
  WHERE id = p_batch_id
  FOR UPDATE;
  
  IF v_available_qty IS NULL THEN
    RETURN json_build_object('error', 'Batch not found');
  END IF;
  
  IF v_available_qty < p_quantity THEN
    RETURN json_build_object('error', 'Insufficient quantity available', 'available', v_available_qty);
  END IF;
  
  -- Update original batch
  UPDATE public.batches
  SET available_quantity_kg = available_quantity_kg - p_quantity,
      status = CASE 
        WHEN available_quantity_kg - p_quantity = 0 THEN 'Sold'
        ELSE 'Partial'
      END
  WHERE id = p_batch_id;
  
  -- Create sub-batch for distributor
  INSERT INTO public.batches (
    farmer_id, crop, total_quantity_kg, available_quantity_kg, 
    price_per_kg, harvest_date, location, metadata_json, parent_batch_id, status
  )
  SELECT 
    p_buyer_id, crop, p_quantity, p_quantity,
    p_price_offered, harvest_date, location, metadata_json, p_batch_id, 'Available'
  FROM public.batches
  WHERE id = p_batch_id
  RETURNING id INTO v_new_batch_id;
  
  -- Create transfer record
  INSERT INTO public.transfers (
    batch_id, from_user_id, to_user_id, quantity_kg, transfer_type, status
  ) VALUES (
    p_batch_id, v_farmer_id, p_buyer_id, p_quantity, 'farmer_to_distributor', 'confirmed'
  ) RETURNING id INTO v_transfer_id;
  
  RETURN json_build_object(
    'success', true,
    'new_batch_id', v_new_batch_id,
    'transfer_id', v_transfer_id
  );
END;
$$;

-- Function to sell to retailer
CREATE OR REPLACE FUNCTION public.sell_to_retailer(
  p_batch_id UUID,
  p_seller_id UUID,
  p_retailer_id UUID,
  p_quantity NUMERIC,
  p_price_per_kg NUMERIC
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available_qty NUMERIC;
  v_transfer_id UUID;
  v_inventory_id UUID;
BEGIN
  -- Lock the batch and check ownership and availability
  SELECT available_quantity_kg INTO v_available_qty
  FROM public.batches
  WHERE id = p_batch_id AND farmer_id = p_seller_id
  FOR UPDATE;
  
  IF v_available_qty IS NULL THEN
    RETURN json_build_object('error', 'Batch not found or not owned by seller');
  END IF;
  
  IF v_available_qty < p_quantity THEN
    RETURN json_build_object('error', 'Insufficient quantity available', 'available', v_available_qty);
  END IF;
  
  -- Update distributor batch
  UPDATE public.batches
  SET available_quantity_kg = available_quantity_kg - p_quantity,
      status = CASE 
        WHEN available_quantity_kg - p_quantity = 0 THEN 'Sold'
        ELSE 'Partial'
      END
  WHERE id = p_batch_id;
  
  -- Create transfer record
  INSERT INTO public.transfers (
    batch_id, from_user_id, to_user_id, quantity_kg, transfer_type, status
  ) VALUES (
    p_batch_id, p_seller_id, p_retailer_id, p_quantity, 'distributor_to_retailer', 'confirmed'
  ) RETURNING id INTO v_transfer_id;
  
  -- Create inventory for retailer
  INSERT INTO public.inventory (
    retailer_id, source_batch_id, quantity_available, retail_price_per_kg
  ) VALUES (
    p_retailer_id, p_batch_id, p_quantity, p_price_per_kg
  ) RETURNING id INTO v_inventory_id;
  
  RETURN json_build_object(
    'success', true,
    'transfer_id', v_transfer_id,
    'inventory_id', v_inventory_id
  );
END;
$$;

-- Function to create order atomically
CREATE OR REPLACE FUNCTION public.create_order(
  p_consumer_id UUID,
  p_retailer_id UUID,
  p_items JSONB,
  p_address JSONB
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_inventory_qty NUMERIC;
  v_price NUMERIC;
BEGIN
  -- Create the order
  INSERT INTO public.orders (consumer_id, retailer_id, total_amount, address_json)
  VALUES (p_consumer_id, p_retailer_id, 0, p_address)
  RETURNING id INTO v_order_id;
  
  -- Process each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Lock inventory and check availability
    SELECT quantity_available, retail_price_per_kg INTO v_inventory_qty, v_price
    FROM public.inventory
    WHERE id = (v_item->>'inventory_id')::UUID AND retailer_id = p_retailer_id
    FOR UPDATE;
    
    IF v_inventory_qty IS NULL THEN
      RETURN json_build_object('error', 'Inventory item not found');
    END IF;
    
    IF v_inventory_qty < (v_item->>'quantity')::NUMERIC THEN
      RETURN json_build_object('error', 'Insufficient inventory', 'item_id', v_item->>'inventory_id');
    END IF;
    
    -- Update inventory
    UPDATE public.inventory
    SET quantity_available = quantity_available - (v_item->>'quantity')::NUMERIC
    WHERE id = (v_item->>'inventory_id')::UUID;
    
    -- Create order item
    INSERT INTO public.order_items (
      order_id, inventory_id, batch_id, quantity, price_per_kg
    )
    SELECT 
      v_order_id, 
      (v_item->>'inventory_id')::UUID,
      source_batch_id,
      (v_item->>'quantity')::NUMERIC,
      v_price
    FROM public.inventory
    WHERE id = (v_item->>'inventory_id')::UUID;
    
    v_total_amount := v_total_amount + (v_price * (v_item->>'quantity')::NUMERIC);
  END LOOP;
  
  -- Update order total
  UPDATE public.orders SET total_amount = v_total_amount WHERE id = v_order_id;
  
  RETURN json_build_object('success', true, 'order_id', v_order_id);
END;
$$;