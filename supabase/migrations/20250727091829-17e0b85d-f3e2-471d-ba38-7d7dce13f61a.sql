-- Fix database schema issues
-- The address column is missing from users table queries

-- First, let's check current structure and add missing fields if needed
-- This will be a no-op if columns already exist

DO $$
BEGIN
    -- Check if address column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE public.users ADD COLUMN address TEXT;
    END IF;
END $$;

-- Ensure all necessary columns exist for order status tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accepted_by TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_by TEXT;

-- Update any existing orders to have proper status flow fields
UPDATE public.orders 
SET accepted_by = NULL, cancelled_by = NULL 
WHERE accepted_by IS NULL AND cancelled_by IS NULL;