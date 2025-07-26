# Vendor Account Information Migration Guide

This guide will help you add the new vendor account fields to your Supabase database.

## Migration Overview

The migration adds the following field to the `users` table:
- `updated_at` - Timestamp for tracking when user data was last updated

## Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Create a new query and paste the following SQL:

```sql
-- Add additional fields to users table for vendor account information
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger for updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing sample users with some vendor information
UPDATE public.users 
SET 
  business_name = 'Vendor Corner',
  phone = '+91 9876543210',
  address = '123 Main Street, Downtown',
  city = 'Mumbai',
  pincode = '400001'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.users 
SET 
  business_name = 'Bob\'s Food Hub',
  phone = '+91 9876543211',
  address = '456 Park Avenue, Midtown',
  city = 'Delhi',
  pincode = '110001'
WHERE id = '33333333-3333-3333-3333-333333333333';
```

4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

1. Navigate to your project directory
2. Run: `supabase db push`

## Verify the Migration

After applying the migration, you can verify it worked by:

1. Going to the **Table Editor** in your Supabase dashboard
2. Selecting the `users` table
3. Checking that the new column is present:
   - `updated_at`

## Features Added

Once the migration is applied, the vendor account settings page will include:

✅ **Account Information Form** - Complete form with all vendor details  
✅ **Editable Fields** - All fields except email can be edited  
✅ **Form Validation** - Proper validation for all input fields  
✅ **Save Functionality** - Updates are saved to Supabase  
✅ **Success Messages** - Toast notifications for successful saves  
✅ **Loading States** - Proper loading indicators  
✅ **Error Handling** - Graceful error handling and display  

## Integration Points

The vendor account information will be integrated throughout the app:

- **Account Settings Page** - Dedicated page for account management
- **Profile Display** - Business information shown in relevant places
- **Order Processing** - Business details used for order fulfillment

## Troubleshooting

If you encounter any issues:

1. **Check Console Logs** - Look for any JavaScript errors
2. **Verify Database Connection** - Ensure Supabase client is properly configured
3. **Check RLS Policies** - Ensure Row Level Security allows updates
4. **Verify User Authentication** - Make sure user is properly authenticated

## Next Steps

After applying the migration:

1. Test the account information form in the vendor dashboard
2. Verify that data is being saved correctly
3. Check that the information is being used in other parts of the app
4. Consider adding additional validation rules if needed 