# Cancellation Tracking Migration Guide

## Problem
We need to track who cancelled an order (vendor or supplier) to show appropriate messages in the UI.

## Solution
Add a `cancelled_by` field to the orders table to track who cancelled the order.

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
-- Add cancelled_by column to orders table
ALTER TABLE public.orders 
ADD COLUMN cancelled_by TEXT CHECK (cancelled_by IN ('vendor', 'supplier'));

-- Update existing cancelled orders to have a default value
-- Since we can't determine who cancelled them, we'll set them as vendor-cancelled
UPDATE public.orders 
SET cancelled_by = 'vendor' 
WHERE status = 'Delivered' AND cancelled_by IS NULL;
```

4. **Click "Run" to execute the migration**

## What This Does

- **Adds a `cancelled_by` column** to track who cancelled the order
- **Sets constraint** to only allow 'vendor' or 'supplier' values
- **Updates existing orders** that might be cancelled to have a default value

## After Migration

Once you've applied this migration, the cancellation tracking will work properly:

1. **When a vendor cancels an order** - `cancelled_by` will be set to 'vendor'
2. **When a supplier declines an order** - `cancelled_by` will be set to 'supplier'
3. **UI will show appropriate messages** - "Cancelled by you" or "Cancelled by supplier"

## Testing

After applying the migration, you can test by:
1. Going to the vendor dashboard
2. Cancelling a pending order
3. Checking that it shows "Cancelled by you"
4. Having a supplier decline an order
5. Checking that it shows "Cancelled by supplier" in the vendor's view 