-- Add location fields to users table
ALTER TABLE users 
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add some sample location data for existing suppliers
UPDATE users 
SET 
  city = CASE 
    WHEN name LIKE '%Kumar%' THEN 'Delhi'
    WHEN name LIKE '%Sharma%' THEN 'Mumbai'
    WHEN name LIKE '%Patel%' THEN 'Ahmedabad'
    WHEN name LIKE '%Gupta%' THEN 'Kolkata'
    ELSE 'Delhi'
  END,
  state = CASE 
    WHEN name LIKE '%Kumar%' THEN 'Delhi'
    WHEN name LIKE '%Sharma%' THEN 'Maharashtra'
    WHEN name LIKE '%Patel%' THEN 'Gujarat'
    WHEN name LIKE '%Gupta%' THEN 'West Bengal'
    ELSE 'Delhi'
  END,
  latitude = CASE 
    WHEN name LIKE '%Kumar%' THEN 28.7041
    WHEN name LIKE '%Sharma%' THEN 19.0760
    WHEN name LIKE '%Patel%' THEN 23.0225
    WHEN name LIKE '%Gupta%' THEN 22.5726
    ELSE 28.7041
  END,
  longitude = CASE 
    WHEN name LIKE '%Kumar%' THEN 77.1025
    WHEN name LIKE '%Sharma%' THEN 72.8777
    WHEN name LIKE '%Patel%' THEN 72.5714
    WHEN name LIKE '%Gupta%' THEN 88.3639
    ELSE 77.1025
  END
WHERE role = 'supplier'; 