import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderCancellation() {
  console.log('🔍 Testing order cancellation...');

  // First, let's check what orders exist
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    return;
  }

  console.log('📊 Orders found:', orders?.length || 0);
  if (orders && orders.length > 0) {
    console.log('📋 Sample orders:');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Vendor ID: ${order.vendor_id}`);
      console.log(`   Supplier ID: ${order.supplier_id}`);
      console.log(`   Created: ${order.created_at}`);
      console.log('---');
    });

    // Test cancelling the first order
    const testOrder = orders[0];
    console.log(`🔄 Testing cancellation for order: ${testOrder.id}`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'Cancelled',
        cancelled_by: 'supplier',
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id)
      .select();

    if (updateError) {
      console.error('❌ Error cancelling order:', updateError);
    } else {
      console.log('✅ Order cancelled successfully:', updateData);
    }

    // Verify the cancellation
    const { data: verifyData, error: verifyError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', testOrder.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying order:', verifyError);
    } else {
      console.log('✅ Verification - Order status:', verifyData.status);
      console.log('✅ Verification - Cancelled by:', verifyData.cancelled_by);
    }
  } else {
    console.log('No orders found to test with');
  }
}

testOrderCancellation().catch(console.error); 