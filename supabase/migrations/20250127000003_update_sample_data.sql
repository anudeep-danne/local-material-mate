-- Update sample users with complete vendor and supplier information
-- This ensures that vendor and supplier details are properly displayed across the app

-- Update vendor users with complete information
UPDATE public.users 
SET 
  business_name = 'Fresh Food Corner',
  email = 'john.vendor@example.com',
  phone = '+91 9876543210',
  address = '123 Main Street, Downtown Area',
  city = 'Mumbai',
  state = 'Maharashtra',
  pincode = '400001',
  latitude = 19.0760,
  longitude = 72.8777,
  description = 'Premium food vendor serving fresh ingredients to local restaurants'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.users 
SET 
  business_name = 'Bob\'s Food Hub',
  email = 'bob.vendor@example.com',
  phone = '+91 9876543211',
  address = '456 Park Avenue, Midtown',
  city = 'Delhi',
  state = 'Delhi',
  pincode = '110001',
  latitude = 28.7041,
  longitude = 77.1025,
  description = 'Reliable food vendor with wide network of suppliers'
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Update supplier users with complete information
UPDATE public.users 
SET 
  business_name = 'Green Valley Farms',
  email = 'jane.supplier@example.com',
  phone = '+91 9876543212',
  address = '789 Farm Road, Agricultural Zone',
  city = 'Pune',
  state = 'Maharashtra',
  pincode = '411001',
  latitude = 18.5204,
  longitude = 73.8567,
  description = 'Premium supplier of fresh vegetables and organic produce'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE public.users 
SET 
  business_name = 'Quality Grains Co.',
  email = 'alice.supplier@example.com',
  phone = '+91 9876543213',
  address = '321 Warehouse Street, Industrial Area',
  city = 'Bangalore',
  state = 'Karnataka',
  pincode = '560001',
  latitude = 12.9716,
  longitude = 77.5946,
  description = 'Leading supplier of premium grains, oils, and dry goods'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Insert additional sample orders to demonstrate the relationships
INSERT INTO public.orders (vendor_id, supplier_id, product_id, quantity, total_amount, status) VALUES 
-- John Vendor orders from Jane Supplier
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 
 (SELECT id FROM public.products WHERE name = 'Fresh Onions' LIMIT 1), 10, 450.00, 'Delivered'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 
 (SELECT id FROM public.products WHERE name = 'Fresh Tomatoes' LIMIT 1), 15, 525.00, 'Packed'),

-- Bob Vendor orders from Alice Supplier  
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
 (SELECT id FROM public.products WHERE name = 'Basmati Rice' LIMIT 1), 5, 400.00, 'Delivered'),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
 (SELECT id FROM public.products WHERE name = 'Sunflower Oil' LIMIT 1), 8, 960.00, 'Pending'),

-- John Vendor also orders from Alice Supplier
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 
 (SELECT id FROM public.products WHERE name = 'Basmati Rice' LIMIT 1), 12, 960.00, 'Delivered');

-- Insert sample reviews to demonstrate the review system
INSERT INTO public.reviews (vendor_id, supplier_id, order_id, rating, comment) VALUES 
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 
 (SELECT id FROM public.orders WHERE vendor_id = '11111111-1111-1111-1111-111111111111' AND supplier_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 5, 'Excellent quality vegetables, very fresh and delivered on time!'),

('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
 (SELECT id FROM public.orders WHERE vendor_id = '33333333-3333-3333-3333-333333333333' AND supplier_id = '44444444-4444-4444-4444-444444444444' LIMIT 1), 
 4, 'Great quality grains, good packaging and reasonable pricing.');

-- Add some items to cart for demonstration
INSERT INTO public.cart (vendor_id, product_id, quantity) VALUES 
('11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM public.products WHERE name = 'Fresh Tomatoes' LIMIT 1), 5),
('33333333-3333-3333-3333-333333333333', 
 (SELECT id FROM public.products WHERE name = 'Sunflower Oil' LIMIT 1), 3); 