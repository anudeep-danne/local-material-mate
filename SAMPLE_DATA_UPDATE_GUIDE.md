# Sample Data Update Guide

## Problem Solved

### Issue
- ❌ Vendor details in incoming orders showing incorrect information
- ❌ Supplier details in browse products not matching actual suppliers
- ❌ Sample data only had basic `name` and `role` fields
- ❌ Missing business information, contact details, and locations

### Solution
- ✅ **Complete vendor and supplier profiles** with business information
- ✅ **Real contact details** (phone, email, address)
- ✅ **Location information** (city, state, coordinates)
- ✅ **Sample orders and reviews** to demonstrate relationships
- ✅ **Enhanced data display** across all pages

## Migration File

**File**: `supabase/migrations/20250127000003_update_sample_data.sql`

### What This Migration Does

#### 1. Updates Vendor Information
```sql
-- John Vendor (ID: 11111111-1111-1111-1111-111111111111)
business_name: 'Fresh Food Corner'
email: 'john.vendor@example.com'
phone: '+91 9876543210'
address: '123 Main Street, Downtown Area'
city: 'Mumbai'
state: 'Maharashtra'

-- Bob Vendor (ID: 33333333-3333-3333-3333-333333333333)
business_name: 'Bob\'s Food Hub'
email: 'bob.vendor@example.com'
phone: '+91 9876543211'
address: '456 Park Avenue, Midtown'
city: 'Delhi'
state: 'Delhi'
```

#### 2. Updates Supplier Information
```sql
-- Jane Supplier (ID: 22222222-2222-2222-2222-222222222222)
business_name: 'Green Valley Farms'
email: 'jane.supplier@example.com'
phone: '+91 9876543212'
address: '789 Farm Road, Agricultural Zone'
city: 'Pune'
state: 'Maharashtra'

-- Alice Supplier (ID: 44444444-4444-4444-4444-444444444444)
business_name: 'Quality Grains Co.'
email: 'alice.supplier@example.com'
phone: '+91 9876543213'
address: '321 Warehouse Street, Industrial Area'
city: 'Bangalore'
state: 'Karnataka'
```

#### 3. Creates Sample Orders
- John Vendor → Jane Supplier (Fresh Onions, Fresh Tomatoes)
- Bob Vendor → Alice Supplier (Basmati Rice, Sunflower Oil)
- John Vendor → Alice Supplier (Basmati Rice)

#### 4. Creates Sample Reviews
- Vendor reviews for suppliers with ratings and comments

#### 5. Creates Sample Cart Items
- Items in cart for demonstration

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration**
   - Copy the contents of `20250127000003_update_sample_data.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify the Update**
   - Go to Table Editor → users
   - Check that all users now have complete information
   - Verify orders, reviews, and cart items are created

### Option 2: Supabase CLI

```bash
# Apply the migration
supabase db push

# Or run the specific migration
supabase migration up
```

## Expected Results

### Before Migration
```
Users Table:
- name: "John Vendor", role: "vendor"
- name: "Jane Supplier", role: "supplier"
- name: "Bob Vendor", role: "vendor"
- name: "Alice Supplier", role: "supplier"
```

### After Migration
```
Users Table:
- name: "John Vendor", business_name: "Fresh Food Corner", 
  email: "john.vendor@example.com", phone: "+91 9876543210",
  city: "Mumbai", state: "Maharashtra"
- name: "Jane Supplier", business_name: "Green Valley Farms",
  email: "jane.supplier@example.com", phone: "+91 9876543212",
  city: "Pune", state: "Maharashtra"
- name: "Bob Vendor", business_name: "Bob's Food Hub",
  email: "bob.vendor@example.com", phone: "+91 9876543211",
  city: "Delhi", state: "Delhi"
- name: "Alice Supplier", business_name: "Quality Grains Co.",
  email: "alice.supplier@example.com", phone: "+91 9876543213",
  city: "Bangalore", state: "Karnataka"
```

## Testing the Update

### 1. Check Incoming Orders (Supplier View)
1. Go to Supplier Dashboard → Incoming Orders
2. Verify vendor details show:
   - **Business Name**: "Fresh Food Corner" or "Bob's Food Hub"
   - **Email**: Proper email addresses
   - **Phone**: Contact numbers
   - **Location**: City and state information

### 2. Check Browse Products (Vendor View)
1. Go to Vendor Dashboard → Browse Products
2. Verify supplier details show:
   - **Business Name**: "Green Valley Farms" or "Quality Grains Co."
   - **Location**: City and state with 📍 icon
   - **Phone**: Contact numbers with 📞 icon

### 3. Check My Orders (Vendor View)
1. Go to Vendor Dashboard → My Orders
2. Verify supplier information shows:
   - **Business Name**: Proper business names
   - **Location**: City and state
   - **Contact**: Phone numbers

### 4. Check Reviews (Vendor View)
1. Go to Vendor Dashboard → Reviews
2. Verify supplier names show business names
3. Check that location information is displayed

## Enhanced Features

### 1. Realistic Business Names
- **Vendors**: "Fresh Food Corner", "Bob's Food Hub"
- **Suppliers**: "Green Valley Farms", "Quality Grains Co."

### 2. Complete Contact Information
- **Email addresses**: Proper business emails
- **Phone numbers**: Indian format (+91)
- **Addresses**: Realistic business addresses

### 3. Location Data
- **Cities**: Mumbai, Delhi, Pune, Bangalore
- **States**: Maharashtra, Delhi, Karnataka
- **Coordinates**: Latitude and longitude for mapping

### 4. Sample Relationships
- **Orders**: Multiple orders between different vendors and suppliers
- **Reviews**: Sample reviews with ratings and comments
- **Cart**: Items in shopping cart for demonstration

## Troubleshooting

### Common Issues

#### 1. Migration Fails
**Cause**: Foreign key constraints or existing data conflicts
**Solution**: 
- Check if the migration file is applied correctly
- Verify that product IDs exist before creating orders
- Ensure all referenced users exist

#### 2. Data Not Updated
**Cause**: Migration not applied or cached data
**Solution**:
- Refresh the application
- Clear browser cache
- Verify migration was successful in Supabase dashboard

#### 3. Missing Information
**Cause**: Some fields might be null
**Solution**:
- Check that all UPDATE statements executed successfully
- Verify the users table has the expected columns

### Verification Commands

```sql
-- Check if users have complete information
SELECT id, name, business_name, email, phone, city, state 
FROM public.users 
WHERE role IN ('vendor', 'supplier');

-- Check if orders exist
SELECT o.id, v.business_name as vendor, s.business_name as supplier, p.name as product
FROM public.orders o
JOIN public.users v ON o.vendor_id = v.id
JOIN public.users s ON o.supplier_id = s.id
JOIN public.products p ON o.product_id = p.id;

-- Check if reviews exist
SELECT r.rating, r.comment, v.business_name as vendor, s.business_name as supplier
FROM public.reviews r
JOIN public.users v ON r.vendor_id = v.id
JOIN public.users s ON r.supplier_id = s.id;
```

## Benefits

### For Development
- ✅ **Realistic testing** with complete data
- ✅ **Proper relationships** between vendors and suppliers
- ✅ **Enhanced UI testing** with full information display

### For Users
- ✅ **Professional appearance** with business names
- ✅ **Complete contact information** for communication
- ✅ **Location context** for better understanding

### For Application
- ✅ **Consistent data** across all pages
- ✅ **Proper foreign key relationships**
- ✅ **Realistic business scenarios**

## Next Steps

After applying this migration:

1. **Test all pages** to ensure vendor/supplier information displays correctly
2. **Verify account synchronization** works with the new data
3. **Check that reviews and orders** show proper relationships
4. **Test the search functionality** with business names and locations

This update ensures that the RawMate application displays accurate and complete vendor and supplier information across all pages! 