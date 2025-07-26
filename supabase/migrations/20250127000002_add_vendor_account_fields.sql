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