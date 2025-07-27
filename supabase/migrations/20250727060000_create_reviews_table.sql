-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unique constraint to prevent multiple reviews per vendor per supplier
CREATE UNIQUE INDEX IF NOT EXISTS reviews_vendor_supplier_unique 
ON public.reviews(vendor_id, supplier_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reviews_supplier_id_idx ON public.reviews(supplier_id);
CREATE INDEX IF NOT EXISTS reviews_vendor_id_idx ON public.reviews(vendor_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Vendors can view their own reviews
CREATE POLICY "Vendors can view their own reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = vendor_id);

-- Suppliers can view reviews about them
CREATE POLICY "Suppliers can view reviews about them" ON public.reviews
    FOR SELECT USING (auth.uid() = supplier_id);

-- Vendors can insert reviews for suppliers they've ordered from
CREATE POLICY "Vendors can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = vendor_id AND
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE vendor_id = auth.uid() 
            AND supplier_id = reviews.supplier_id
            AND id = reviews.order_id
        )
    );

-- Vendors can update their own reviews
CREATE POLICY "Vendors can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = vendor_id);

-- Vendors can delete their own reviews
CREATE POLICY "Vendors can delete their own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = vendor_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 