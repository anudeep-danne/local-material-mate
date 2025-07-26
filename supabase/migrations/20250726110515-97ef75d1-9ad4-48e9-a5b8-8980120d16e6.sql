-- Add additional fields to users table for supplier information
ALTER TABLE public.users ADD COLUMN business_name TEXT;
ALTER TABLE public.users ADD COLUMN email TEXT;
ALTER TABLE public.users ADD COLUMN phone TEXT;
ALTER TABLE public.users ADD COLUMN address TEXT;
ALTER TABLE public.users ADD COLUMN city TEXT;
ALTER TABLE public.users ADD COLUMN state TEXT;
ALTER TABLE public.users ADD COLUMN pincode TEXT;
ALTER TABLE public.users ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE public.users ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE public.users ADD COLUMN description TEXT;

-- Update existing supplier data with sample information
UPDATE public.users 
SET 
  business_name = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'Kumar Vegetables'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'Fresh Farm Produce'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'Spice Master'
    ELSE 'Sample Business'
  END,
  email = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'rajesh@kumarveg.com'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'priya@freshfarm.com'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'amit@spicemaster.com'
    ELSE 'supplier@example.com'
  END,
  phone = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN '+91 98765 43210'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN '+91 87654 32109'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN '+91 76543 21098'
    ELSE '+91 99999 99999'
  END,
  address = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'Shop 15, Sector 14 Market'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'Farm House, Village Kharkhoda'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'Spice Market, Chandni Chowk'
    ELSE 'Sample Address'
  END,
  city = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'New Delhi'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'Sonepat'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'Delhi'
    ELSE 'Sample City'
  END,
  state = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'Delhi'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'Haryana'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'Delhi'
    ELSE 'Sample State'
  END,
  pincode = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN '110001'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN '131001'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN '110006'
    ELSE '000000'
  END,
  latitude = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 28.6139
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 28.9931
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 28.6562
    ELSE 28.6139
  END,
  longitude = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 77.2090
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 77.0151
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 77.2410
    ELSE 77.2090
  END,
  description = CASE 
    WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'Fresh vegetables and produce supplier for street food vendors across Delhi NCR.'
    WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'Organic farm producing fresh vegetables and grains.'
    WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'Traditional spice merchant with authentic Indian spices.'
    ELSE 'Quality supplier for your business needs'
  END
WHERE role = 'supplier';