-- Fix order status constraints to allow all required statuses

-- First, let's check what constraints exist on the status column
-- Drop any existing constraints that might be limiting the status values
DO $$ 
BEGIN
    -- Drop any existing check constraints on the status column
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%status%' 
        AND table_name = 'orders' 
        AND constraint_type = 'CHECK'
    ) THEN
        EXECUTE (
            'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS ' || 
            (SELECT constraint_name FROM information_schema.table_constraints 
             WHERE constraint_name LIKE '%status%' 
             AND table_name = 'orders' 
             AND constraint_type = 'CHECK' LIMIT 1)
        );
    END IF;
END $$;

-- Add a proper check constraint that allows all our required statuses
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));

-- Add an index on the status column for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Log the current status values in the database for debugging
DO $$
DECLARE
    status_count RECORD;
BEGIN
    RAISE NOTICE 'Current order statuses in database:';
    FOR status_count IN 
        SELECT status, COUNT(*) as count 
        FROM public.orders 
        GROUP BY status 
        ORDER BY status
    LOOP
        RAISE NOTICE 'Status: %, Count: %', status_count.status, status_count.count;
    END LOOP;
END $$; 