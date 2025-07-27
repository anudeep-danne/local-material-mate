-- Check and restore products data

-- First, let's see what products currently exist
DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.products;
    RAISE NOTICE 'Current products count: %', product_count;
    
    -- If no products exist, restore sample data
    IF product_count = 0 THEN
        RAISE NOTICE 'No products found, restoring sample data...';
        
        INSERT INTO public.products (name, price, stock, category, image_url, supplier_id) VALUES 
        ('Fresh Onions', 45.00, 150, 'Vegetables', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150', '22222222-2222-2222-2222-222222222222'),
        ('Fresh Tomatoes', 35.00, 100, 'Vegetables', 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=150', '22222222-2222-2222-2222-222222222222'),
        ('Basmati Rice', 80.00, 200, 'Grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150', '44444444-4444-4444-4444-444444444444'),
        ('Sunflower Oil', 120.00, 75, 'Oils', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150', '44444444-4444-4444-4444-444444444444');
        
        RAISE NOTICE 'Sample products restored successfully';
    ELSE
        RAISE NOTICE 'Products already exist, no action needed';
    END IF;
END $$;

-- Also check if users exist
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    RAISE NOTICE 'Current users count: %', user_count;
    
    -- If no users exist, restore sample users
    IF user_count = 0 THEN
        RAISE NOTICE 'No users found, restoring sample users...';
        
        INSERT INTO public.users (id, name, role) VALUES 
        ('11111111-1111-1111-1111-111111111111', 'John Vendor', 'vendor'),
        ('22222222-2222-2222-2222-222222222222', 'Jane Supplier', 'supplier'),
        ('33333333-3333-3333-3333-333333333333', 'Bob Vendor', 'vendor'),
        ('44444444-4444-4444-4444-444444444444', 'Alice Supplier', 'supplier');
        
        RAISE NOTICE 'Sample users restored successfully';
    ELSE
        RAISE NOTICE 'Users already exist, no action needed';
    END IF;
END $$;

-- Log the current state
SELECT 
    'Products' as table_name,
    COUNT(*) as record_count
FROM public.products
UNION ALL
SELECT 
    'Users' as table_name,
    COUNT(*) as record_count
FROM public.users; 