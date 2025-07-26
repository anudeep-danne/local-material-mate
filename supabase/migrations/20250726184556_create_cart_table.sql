-- Create cart table if it doesn't exist
-- This migration ensures the cart table is properly set up

-- Create cart table
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_vendor_id ON public.cart(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON public.cart(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_vendor_product ON public.cart(vendor_id, product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow vendors to view their own cart items
CREATE POLICY "Vendors can view their own cart items" ON public.cart
  FOR SELECT USING (auth.uid() = vendor_id);

-- Allow vendors to insert their own cart items
CREATE POLICY "Vendors can insert their own cart items" ON public.cart
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

-- Allow vendors to update their own cart items
CREATE POLICY "Vendors can update their own cart items" ON public.cart
  FOR UPDATE USING (auth.uid() = vendor_id);

-- Allow vendors to delete their own cart items
CREATE POLICY "Vendors can delete their own cart items" ON public.cart
  FOR DELETE USING (auth.uid() = vendor_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_cart_updated_at_trigger ON public.cart;
CREATE TRIGGER update_cart_updated_at_trigger
  BEFORE UPDATE ON public.cart
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.cart IS 'Shopping cart items for vendors';
COMMENT ON COLUMN public.cart.vendor_id IS 'ID of the vendor who owns this cart item';
COMMENT ON COLUMN public.cart.product_id IS 'ID of the product in the cart';
COMMENT ON COLUMN public.cart.quantity IS 'Quantity of the product in the cart';
COMMENT ON CONSTRAINT cart_vendor_id_fkey ON public.cart IS 'Foreign key reference to users table';
COMMENT ON CONSTRAINT cart_product_id_fkey ON public.cart IS 'Foreign key reference to products table';
