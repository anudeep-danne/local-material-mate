import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupplierCancellation() {
  console.log('🔍 Testing supplier order cancellation...');

  // First, let's check what orders exist for suppliers
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
      console.log(`   Cancelled by: ${order.cancelled_by || 'N/A'}`);
      console.log(`   Vendor ID: ${order.vendor_id}`);
      console.log(`   Supplier ID: ${order.supplier_id}`);
      console.log(`   Created: ${order.created_at}`);
      console.log('---');
    });

    // Find an order that can be cancelled (not already cancelled or delivered)
    const cancellableOrder = orders.find(order => 
      order.status !== 'Cancelled' && order.status !== 'Delivered'
    );

    if (cancellableOrder) {
      console.log(`🔄 Testing supplier cancellation for order: ${cancellableOrder.id}`);
      console.log(`   Current status: ${cancellableOrder.status}`);
      console.log(`   Supplier ID: ${cancellableOrder.supplier_id}`);
      
      // Test cancelling the order as a supplier using the updateOrderStatus approach
      const { data: updateData, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'Cancelled',
          cancelled_by: 'supplier',
          updated_at: new Date().toISOString()
        })
        .eq('id', cancellableOrder.id)
        .select();

      if (updateError) {
        console.error('❌ Error cancelling order:', updateError);
        console.error('Error details:', updateError.message);
        console.error('Error code:', updateError.code);
      } else {
        console.log('✅ Order cancelled successfully:', updateData);
      }

      // Verify the cancellation
      const { data: verifyData, error: verifyError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', cancellableOrder.id)
        .single();

      if (verifyError) {
        console.error('❌ Error verifying order:', verifyError);
      } else {
        console.log('✅ Verification - Order status:', verifyData.status);
        console.log('✅ Verification - Cancelled by:', verifyData.cancelled_by);
        console.log('✅ Verification - Updated at:', verifyData.updated_at);
      }
    } else {
      console.log('No cancellable orders found (all orders are already cancelled or delivered)');
    }
  } else {
    console.log('No orders found to test with');
  }
}

testSupplierCancellation().catch(console.error); 