# 🔧 Troubleshooting: Still Showing "Kumar Vegetables" Instead of "Viswas Co"

## 🚨 **IMMEDIATE STEPS TO FIX**

The issue is that products are still linked to old supplier accounts. Here's how to fix it:

## **Step 1: Check Current Database State**

### **Run this in Supabase SQL Editor:**

```sql
-- Check all users and their business information
SELECT 
  id,
  name,
  email,
  role,
  business_name,
  phone,
  city,
  state,
  created_at
FROM public.users 
WHERE role = 'supplier' OR role = 'vendor'
ORDER BY created_at DESC;
```

**Look for your "Viswas Co" account and note its ID.**

### **Check Product-Supplier Links:**

```sql
-- Check what products exist and their current supplier links
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.supplier_id,
  u.name as supplier_name,
  u.business_name as supplier_business_name,
  u.email as supplier_email
FROM public.products p
JOIN public.users u ON p.supplier_id = u.id
ORDER BY p.created_at DESC;
```

**This will show you which products are linked to which suppliers.**

## **Step 2: Fix the Product Links**

### **Option A: Update Products to Link to Your Account**

Replace `YOUR_VISWAS_CO_ID` with the actual ID of your Viswas Co account:

```sql
-- Update all products to link to your Viswas Co account
UPDATE public.products 
SET supplier_id = 'YOUR_VISWAS_CO_ID'
WHERE supplier_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
```

### **Option B: Delete Old Products and Create New Ones**

```sql
-- Delete old sample products
DELETE FROM public.products 
WHERE supplier_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
```

Then add new products through your supplier dashboard.

## **Step 3: Clear Browser Cache**

1. **Hard Refresh**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear Cache**: Go to browser settings and clear all cache
3. **Open Developer Tools**: Press F12 and check the Console tab

## **Step 4: Check Browser Console**

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Refresh the page
4. Look for messages starting with:
   - `🔄 useProducts: Fetching products`
   - `📦 useProducts: Raw product data`
   - `🔍 useProducts: Processing product`

These will show you what data is being fetched and processed.

## **Step 5: Verify Your Account Settings**

1. **Login** to your supplier account
2. Go to **Account Settings**
3. **Verify** your business name is set to "Viswas Co"
4. **Save** if you made any changes

## **Step 6: Test the Fix**

1. **Refresh** the browse products page
2. **Check** if products now show "Viswas Co" instead of "Kumar Vegetables"
3. **Verify** other supplier details are correct

## **🔍 Debugging Information**

### **What the Console Should Show:**

```
🔄 useProducts: Fetching products with filters: {category: undefined, supplierId: undefined, priceMin: undefined, priceMax: undefined}
📦 useProducts: Raw product data: [...]
🔍 useProducts: Processing product: Fresh Tomatoes Supplier: {id: "your-id", name: "Your Name", business_name: "Viswas Co", ...}
✅ useProducts: Processed products: [...]
```

### **If You Still See Old Data:**

1. **Check Network Tab**: In Developer Tools, go to Network tab and look for Supabase requests
2. **Check Response**: Click on the requests to see what data is being returned
3. **Look for Caching**: Check if responses have cache headers

## **🚨 Common Issues and Solutions**

### **Issue 1: Products Still Show Old Supplier**
**Solution**: The products are linked to old supplier IDs. Use Step 2 to fix the links.

### **Issue 2: Browser Cache**
**Solution**: Clear browser cache and hard refresh the page.

### **Issue 3: Account Not Updated**
**Solution**: Make sure your account settings are saved with "Viswas Co" as business name.

### **Issue 4: Database Migration Not Applied**
**Solution**: Check if the migration was applied successfully in Supabase.

## **📋 Quick Checklist**

- [ ] **Database Migration Applied**: Check Supabase migration history
- [ ] **User Account Updated**: Verify "Viswas Co" is set in Account Settings
- [ ] **Product Links Fixed**: Update products to link to your account
- [ ] **Browser Cache Cleared**: Hard refresh the page
- [ ] **Console Checked**: Look for debugging messages
- [ ] **Network Tab Checked**: Verify Supabase requests return correct data

## **🎯 Expected Result**

After completing these steps, you should see:

```
Supplier: Viswas Co
Phone: [Your Real Phone Number]
Location: [Your Real City, State]
```

Instead of:

```
Supplier: Kumar Vegetables
Phone: +91 9876543210
Location: Mumbai, Maharashtra
```

## **📞 If Still Not Working**

1. **Check the console logs** for any error messages
2. **Verify the database queries** return the correct data
3. **Make sure your account ID** is correctly linked to products
4. **Contact support** with the console logs and database query results

The key issue is that products need to be linked to your actual supplier account (Viswas Co) instead of the old sample accounts. 