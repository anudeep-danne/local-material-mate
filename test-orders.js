import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrders() {
  console.log('🔍 Testing orders in database...');

  // Check all orders
  const { data: allOrders, error: allError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('Error fetching all orders:', allError);
    return;
  }

  console.log('📊 All orders in database:', allOrders?.length || 0);
  if (allOrders && allOrders.length > 0) {
    allOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order.id,
        vendor_id: order.vendor_id,
        supplier_id: order.supplier_id,
        product_id: order.product_id,
        status: order.status,
        created_at: order.created_at
      });
    });
  }

  // Check orders with joins
  const { data: ordersWithJoins, error: joinsError } = await supabase
    .from('orders')
    .select(`
      *,
      vendor:users!orders_vendor_id_fkey(
        id,
        name,
        email,
        role,
        business_name
      ),
      supplier:users!orders_supplier_id_fkey(
        id,
        name,
        email,
        role,
        business_name
      ),
      product:products!orders_product_id_fkey(
        id,
        name,
        price,
        category,
        stock
      )
    `)
    .order('created_at', { ascending: false });

  if (joinsError) {
    console.error('Error fetching orders with joins:', joinsError);
    return;
  }

  console.log('📊 Orders with joins:', ordersWithJoins?.length || 0);
  if (ordersWithJoins && ordersWithJoins.length > 0) {
    ordersWithJoins.forEach((order, index) => {
      console.log(`Order with joins ${index + 1}:`, {
        id: order.id,
        vendor_id: order.vendor_id,
        supplier_id: order.supplier_id,
        status: order.status,
        vendor: order.vendor,
        supplier: order.supplier,
        product: order.product
      });
    });
  }
}

testOrders().catch(console.error); 