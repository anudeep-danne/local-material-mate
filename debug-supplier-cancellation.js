import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSupplierCancellation() {
  console.log('🔍 Debugging supplier order cancellation...');

  // Step 1: Check if we can connect to the database
  console.log('📡 Testing database connection...');
  const { data: testData, error: testError } = await supabase
    .from('orders')
    .select('count')
    .limit(1);

  if (testError) {
    console.error('❌ Database connection failed:', testError);
    return;
  }
  console.log('✅ Database connection successful');

  // Step 2: Check orders table structure
  console.log('📋 Checking orders table structure...');
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .limit(3);

  if (ordersError) {
    console.error('❌ Error fetching orders:', ordersError);
    return;
  }

  if (orders && orders.length > 0) {
    console.log('✅ Orders table structure:');
    console.log('Sample order fields:', Object.keys(orders[0]));
    console.log('Sample order:', orders[0]);
  }

  // Step 3: Find a cancellable order
  const cancellableOrder = orders?.find(order => 
    order.status !== 'Cancelled' && order.status !== 'Delivered'
  );

  if (!cancellableOrder) {
    console.log('❌ No cancellable orders found');
    return;
  }

  console.log('🔄 Testing cancellation for order:', cancellableOrder.id);
  console.log('Current status:', cancellableOrder.status);

  // Step 4: Test the exact update that the supplier would do
  const updateData = {
    status: 'Cancelled',
    cancelled_by: 'supplier',
    updated_at: new Date().toISOString()
  };

  console.log('📝 Update data:', updateData);

  const { data: updateResult, error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', cancellableOrder.id)
    .select();

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    console.error('Error message:', updateError.message);
    console.error('Error code:', updateError.code);
    console.error('Error details:', updateError.details);
    console.error('Error hint:', updateError.hint);
    
    // Step 5: Check if it's an RLS issue
    console.log('🔒 Checking RLS policies...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', cancellableOrder.id);

    if (rlsError) {
      console.error('❌ RLS issue detected:', rlsError);
    } else {
      console.log('✅ RLS allows reading the order');
    }
    
    return;
  }

  console.log('✅ Update successful:', updateResult);

  // Step 6: Verify the update
  const { data: verifyData, error: verifyError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', cancellableOrder.id)
    .single();

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
  } else {
    console.log('✅ Verification successful:');
    console.log('Status:', verifyData.status);
    console.log('Cancelled by:', verifyData.cancelled_by);
    console.log('Updated at:', verifyData.updated_at);
  }
}

debugSupplierCancellation().catch(console.error); 