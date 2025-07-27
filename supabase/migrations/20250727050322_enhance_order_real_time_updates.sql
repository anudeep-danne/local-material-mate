-- Enhance order real-time updates and ensure proper triggers

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS notify_order_changes ON public.orders;
DROP FUNCTION IF EXISTS notify_order_changes();

-- Create a function to notify order changes
CREATE OR REPLACE FUNCTION notify_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify about the change
  PERFORM pg_notify(
    'order_changes',
    json_build_object(
      'table', TG_TABLE_NAME,
      'type', TG_OP,
      'record', row_to_json(NEW),
      'old_record', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order changes
CREATE TRIGGER notify_order_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_changes();

-- Ensure RLS policies are correct for orders
DROP POLICY IF EXISTS "Enable all order operations for authenticated users" ON public.orders;
CREATE POLICY "Enable all order operations for authenticated users" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- Ensure orders table has proper structure
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at_trigger ON public.orders;
CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Ensure proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON public.orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Add a function to get orders with proper filtering
CREATE OR REPLACE FUNCTION get_vendor_orders(vendor_uuid UUID)
RETURNS TABLE (
  id UUID,
  vendor_id UUID,
  supplier_id UUID,
  product_id UUID,
  quantity INTEGER,
  total_amount DECIMAL,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  vendor_name TEXT,
  supplier_name TEXT,
  product_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.vendor_id,
    o.supplier_id,
    o.product_id,
    o.quantity,
    o.total_amount,
    o.status,
    o.created_at,
    o.updated_at,
    v.name as vendor_name,
    s.name as supplier_name,
    p.name as product_name
  FROM public.orders o
  LEFT JOIN public.users v ON o.vendor_id = v.id
  LEFT JOIN public.users s ON o.supplier_id = s.id
  LEFT JOIN public.products p ON o.product_id = p.id
  WHERE o.vendor_id = vendor_uuid
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Add a function to get supplier orders
CREATE OR REPLACE FUNCTION get_supplier_orders(supplier_uuid UUID)
RETURNS TABLE (
  id UUID,
  vendor_id UUID,
  supplier_id UUID,
  product_id UUID,
  quantity INTEGER,
  total_amount DECIMAL,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  vendor_name TEXT,
  supplier_name TEXT,
  product_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.vendor_id,
    o.supplier_id,
    o.product_id,
    o.quantity,
    o.total_amount,
    o.status,
    o.created_at,
    o.updated_at,
    v.name as vendor_name,
    s.name as supplier_name,
    p.name as product_name
  FROM public.orders o
  LEFT JOIN public.users v ON o.vendor_id = v.id
  LEFT JOIN public.users s ON o.supplier_id = s.id
  LEFT JOIN public.products p ON o.product_id = p.id
  WHERE o.supplier_id = supplier_uuid
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_vendor_orders(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_supplier_orders(UUID) TO authenticated; 