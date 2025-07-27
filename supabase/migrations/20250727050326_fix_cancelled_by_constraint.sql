-- Fix the cancelled_by constraint to be more flexible
-- The current constraint might be too restrictive

-- First, drop the existing constraint if it exists
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_cancelled_by_check;

-- Add a more flexible constraint that allows null values
ALTER TABLE public.orders 
ADD CONSTRAINT orders_cancelled_by_check 
CHECK (cancelled_by IS NULL OR cancelled_by IN ('vendor', 'supplier'));

-- Also ensure the column allows null values
ALTER TABLE public.orders ALTER COLUMN cancelled_by DROP NOT NULL; 