-- Drop existing reviews table and recreate with product-level support
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Create new reviews table with product-level support
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unique constraint to prevent multiple reviews per product per vendor per order
CREATE UNIQUE INDEX reviews_product_vendor_order_unique 
ON public.reviews(product_id, vendor_id, order_id);

-- Create indexes for better performance
CREATE INDEX reviews_product_id_idx ON public.reviews(product_id);
CREATE INDEX reviews_supplier_id_idx ON public.reviews(supplier_id);
CREATE INDEX reviews_vendor_id_idx ON public.reviews(vendor_id);
CREATE INDEX reviews_order_id_idx ON public.reviews(order_id);
CREATE INDEX reviews_created_at_idx ON public.reviews(created_at DESC);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Vendors can view their own reviews
CREATE POLICY "Vendors can view their own reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = vendor_id);

-- Suppliers can view reviews about their products
CREATE POLICY "Suppliers can view reviews about their products" ON public.reviews
    FOR SELECT USING (auth.uid() = supplier_id);

-- Vendors can insert reviews for products they've ordered
CREATE POLICY "Vendors can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = vendor_id AND
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE vendor_id = auth.uid() 
            AND supplier_id = reviews.supplier_id
            AND product_id = reviews.product_id
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

-- Function to calculate product average rating
CREATE OR REPLACE FUNCTION calculate_product_average_rating(product_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM public.reviews
    WHERE product_id = product_uuid;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate supplier average rating
CREATE OR REPLACE FUNCTION calculate_supplier_average_rating(supplier_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT COALESCE(AVG(product_avg), 0) INTO avg_rating
    FROM (
        SELECT calculate_product_average_rating(p.id) as product_avg
        FROM public.products p
        WHERE p.supplier_id = supplier_uuid
    ) product_ratings;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql; 