-- Add missing updated_at column to orders table and set up automatic updates
ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing records to have updated_at same as created_at initially
UPDATE public.orders SET updated_at = created_at;

-- Make updated_at non-nullable now that all records have values
ALTER TABLE public.orders ALTER COLUMN updated_at SET NOT NULL;

-- Create or replace the trigger function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at when orders are modified
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();