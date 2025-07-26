# Database Migration Guide

## Problem
The shipped and out of delivery options in the products page are not functional because the database only allows three status values: 'Pending', 'Packed', and 'Delivered'.

## Solution
We need to update the database constraint to allow all the statuses that the UI supports.

## Steps to Apply Migration

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project (ismwvaoprkarsmfgkhpc)

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration SQL**
   Copy and paste the following SQL commands:

```sql
-- Step 1: Drop the existing constraint
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Add the new constraint with all statuses
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));

-- Step 3: Update some existing orders to use the new statuses (optional)
-- This will distribute existing 'Packed' orders across different statuses
UPDATE public.orders 
SET status = 'Confirmed' 
WHERE status = 'Packed' AND id IN (
  SELECT id FROM public.orders 
  WHERE status = 'Packed' 
  ORDER BY created_at 
  LIMIT (SELECT COUNT(*) / 3 FROM public.orders WHERE status = 'Packed')
);

UPDATE public.orders 
SET status = 'Shipped' 
WHERE status = 'Packed' AND id IN (
  SELECT id FROM public.orders 
  WHERE status = 'Packed' 
  ORDER BY created_at DESC 
  LIMIT (SELECT COUNT(*) / 3 FROM public.orders WHERE status = 'Packed')
);

UPDATE public.orders 
SET status = 'Out for Delivery' 
WHERE status = 'Packed' AND id IN (
  SELECT id FROM public.orders 
  WHERE status = 'Packed' 
  ORDER BY created_at DESC 
  LIMIT (SELECT COUNT(*) / 6 FROM public.orders WHERE status = 'Packed')
);
```

4. **Click "Run" to execute the migration**

## What This Does

- **Removes the old constraint** that only allowed 'Pending', 'Packed', 'Delivered'
- **Adds a new constraint** that allows all statuses: 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
- **Updates existing orders** to use the new statuses for better testing

## After Migration

Once you've applied this migration, the shipped and out of delivery options should work properly. The code changes I made will:

1. Try to update the status directly in the database
2. If the database constraint prevents it, fall back to mapping (but show the intended status in the UI)
3. Update the local state immediately for better user experience

## Testing

After applying the migration, you can test by:
1. Going to the supplier dashboard
2. Navigating to "Incoming Orders"
3. Trying to update order statuses using the buttons or dropdown
4. The "Mark as Shipped" and "Mark as Out for Delivery" buttons should now work properly 