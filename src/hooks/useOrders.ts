import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Order = Database['public']['Tables']['orders']['Row'] & {
  vendor: Database['public']['Tables']['users']['Row'];
  supplier: Database['public']['Tables']['users']['Row'];
  product: Database['public']['Tables']['products']['Row'];
  cancelled_by?: 'vendor' | 'supplier';
};

export const useOrders = (userId: string | null, userRole: 'vendor' | 'supplier') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (userId && userId.trim() !== '') {
      console.log('🔄 Orders: Setting up real-time subscription for orders, user:', userId, 'role:', userRole);
      setLoading(true);
      fetchOrders();

      // Set up real-time subscription for order changes
      const channel = supabase
        .channel(`orders-changes-${userId}-${userRole}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log('🔄 Orders: Real-time order change detected');
            console.log('🔄 Orders: Payload:', payload);
            
            // Only refresh if the change is relevant to this user
            const orderData = payload.new || payload.old;
            if (orderData) {
              const isRelevant = userRole === 'vendor' 
                ? (orderData as any).vendor_id === userId
                : (orderData as any).supplier_id === userId;
              
              if (isRelevant) {
                console.log('🔄 Orders: Relevant order change, refreshing orders...');
                console.log('🔄 Orders: Order data:', orderData);
                // Add a small delay to ensure the database transaction is complete
                setTimeout(() => {
                  fetchOrders();
                }, 500);
              } else {
                console.log('🔄 Orders: Order change not relevant to this user, skipping refresh');
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('🔄 Orders: Real-time subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('🔄 Orders: Successfully subscribed to order changes');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('🔄 Orders: Real-time subscription error');
          }
        });

      return () => {
        console.log('🔄 Orders: Cleaning up real-time subscription for user:', userId);
        supabase.removeChannel(channel);
      };
    } else {
      console.log('🔄 Orders: No valid user ID, clearing orders');
      setOrders([]);
      setLoading(false);
      setError(null);
    }
  }, [userId, userRole]);

  const fetchOrders = async () => {
    if (!userId || userId.trim() === '') {
      console.log('🔄 Orders: No valid user ID, skipping fetch');
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const column = userRole === 'vendor' ? 'vendor_id' : 'supplier_id';
      
      console.log('🔄 Orders: Fetching orders for user:', userId, 'role:', userRole);
      
      const { data, error } = await supabase
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
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🔄 Orders: Error fetching orders:', error);
        setError(error.message);
        setOrders([]);
        return;
      }
      
      console.log('🔄 Orders: Orders found:', data?.length || 0);
      
      // Log the status of each order for debugging
      if (data && data.length > 0) {
        console.log('🔄 Orders: Order statuses:', data.map((order: any) => ({
          id: order.id,
          status: order.status,
          updated_at: order.updated_at
        })));
      }
      
      // Process the data and filter out orders with invalid vendor data
      const processedData = (data as unknown as Order[]).filter(order => {
        // For vendors, check if the order belongs to them
        if (userRole === 'vendor') {
          return order.vendor && order.vendor.id === userId;
        }
        
        // For suppliers, check if the order belongs to them
        if (userRole === 'supplier') {
          return order.supplier && order.supplier.id === userId;
        }
        
        return true;
      });
      
      console.log('🔄 Orders: Processed orders count:', processedData.length);
      setOrders(processedData);
    } catch (err) {
      console.error('🔄 Orders: Error in fetchOrders:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (cartItems: any[]) => {
    try {
      console.log('🔄 Orders: Placing orders for cart items:', cartItems);
      console.log('🔄 Orders: Cart items structure:', cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        vendor_id: item.vendor_id,
        product: {
          id: item.product?.id,
          name: item.product?.name,
          supplier_id: item.product?.supplier_id,
          price: item.product?.price
        }
      })));
      
      // Test: Log the first cart item in detail
      if (cartItems.length > 0) {
        const firstItem = cartItems[0];
        console.log('🔄 Orders: First cart item detailed structure:', {
          id: firstItem.id,
          product_id: firstItem.product_id,
          product_id_from_product: firstItem.product?.id,
          quantity: firstItem.quantity,
          vendor_id: firstItem.vendor_id,
          product: firstItem.product
        });
      }
      
      // First, validate stock availability for all items
      for (const item of cartItems) {
        const productId = item.product_id || item.product?.id;
        console.log('🔄 Orders: Validating stock for product:', productId, 'Quantity:', item.quantity);
        
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name, stock')
          .eq('id', productId)
          .single();
        
        if (productError || !product) {
          throw new Error(`Product not found: ${productId}`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
      }
      
      // Create orders and reduce stock atomically
      const orderPromises = cartItems.map(async (item) => {
        const totalAmount = item.product.price * item.quantity;
        
        // Ensure we have the correct product_id
        const productId = item.product_id || item.product?.id;
        if (!productId) {
          throw new Error('Product ID not found in cart item');
        }
        
        console.log('🔄 Orders: Creating order for item:', {
          vendor_id: item.vendor_id,
          supplier_id: item.product.supplier_id,
          product_id: productId,
          quantity: item.quantity,
          total_amount: totalAmount,
          status: 'Pending'
        });
        
        // First, reduce stock to ensure it's available
        console.log('🔄 Orders: Attempting to reduce stock for product:', productId, 'Quantity:', item.quantity);
        console.log('🔄 Orders: Item structure:', {
          id: item.id,
          product_id: productId,
          quantity: item.quantity,
          vendor_id: item.vendor_id,
          product: item.product
        });
        
        // Direct test: Let's verify the product exists first
        const { data: testProduct, error: testError } = await supabase
          .from('products')
          .select('id, name, stock')
          .eq('id', productId)
          .single();
        
        console.log('🔄 Orders: Product verification before stock reduction:', { testProduct, testError });
        
        if (testError || !testProduct) {
          throw new Error(`Product not found before stock reduction: ${productId}`);
        }
        
        // Try stock reduction with better error handling
        try {
          const { data: stockResult, error: stockError } = await supabase
            .rpc('reduce_product_stock', {
              p_product_id: productId,
              p_quantity: item.quantity
            });
          
          if (stockError) {
            console.error('❌ Orders: Stock reduction failed:', stockError);
            console.error('❌ Orders: Product ID:', productId);
            console.error('❌ Orders: Quantity:', item.quantity);
            throw new Error(`Failed to reduce stock: ${stockError.message}`);
          }
          
          console.log('✅ Orders: Stock reduced successfully for product:', productId);
        } catch (stockError) {
          console.error('❌ Orders: Exception during stock reduction:', stockError);
          throw new Error(`Stock reduction failed: ${stockError instanceof Error ? stockError.message : 'Unknown error'}`);
        }
        
        // Now create the order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            vendor_id: item.vendor_id,
            supplier_id: item.product.supplier_id,
            product_id: productId,
            quantity: item.quantity,
            total_amount: totalAmount,
            status: 'Pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (orderError) {
          // If order creation fails, we should restore the stock
          console.error('❌ Orders: Order creation failed, restoring stock:', orderError);
          try {
            await supabase.rpc('restore_product_stock', {
              p_product_id: productId,
              p_quantity: item.quantity
            });
            console.log('✅ Orders: Stock restored after order creation failure');
          } catch (restoreError) {
            console.error('❌ Orders: Failed to restore stock after order creation failure:', restoreError);
          }
          throw new Error(`Failed to create order: ${orderError.message}`);
        }
        
        console.log('✅ Orders: Order created successfully for product:', productId);
        return order;
      });

      const results = await Promise.all(orderPromises);
      
      console.log('🔄 Orders: All orders placed successfully');
      toast.success('Orders placed successfully!');
      
      // The real-time subscription will automatically refresh the orders
      // But we can also manually refresh to ensure immediate update
      console.log('🔄 Orders: Triggering immediate order refresh...');
      
      // Immediate refresh after order placement
      setTimeout(() => {
        console.log('🔄 Orders: Executing immediate fetchOrders after order placement...');
        fetchOrders();
      }, 100);
      
      // Additional refresh after a short delay to ensure order is in database
      setTimeout(() => {
        console.log('🔄 Orders: Executing delayed fetchOrders after order placement...');
        fetchOrders();
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('🔄 Orders: Error placing orders:', err);
      const message = err instanceof Error ? err.message : 'Failed to place orders';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'Pending' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled') => {
    try {
      console.log('🔄 Orders: Updating order status:', orderId, 'to:', status);
      
      // Try to update with the requested status first
      let { error } = await supabase
        .from('orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      // If that fails, try with a fallback status
      if (error) {
        console.warn('Failed to set status to', status, 'trying fallback:', error.message);
        
        // Map to allowed DB values - use the actual status instead of fallback
        let dbStatus: string = status;
        if (status === 'Pending') dbStatus = 'Pending';
        else if (status === 'Packed') dbStatus = 'Packed';
        else if (status === 'Shipped') dbStatus = 'Shipped';
        else if (status === 'Out for Delivery') dbStatus = 'Out for Delivery';
        else if (status === 'Delivered') dbStatus = 'Delivered';
        else if (status === 'Cancelled') dbStatus = 'Cancelled';
        
        console.log('🔄 Orders: Using fallback status:', dbStatus);
        
        const { error: fallbackError } = await supabase
          .from('orders')
          .update({ 
            status: dbStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (fallbackError) {
          console.error('Failed to update order status:', fallbackError);
          throw fallbackError;
        }
      } else {
        console.log('✅ Orders: Status updated successfully to:', status);
      }
      
      // Update local state to show the intended status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: status,
                cancelled_by: status === 'Cancelled' && userRole === 'supplier' ? 'supplier' : order.cancelled_by,
                updated_at: new Date().toISOString()
              }
            : order
        )
      );
      
      toast.success(`Order status updated to ${status}`);
      
      // Don't refetch immediately to preserve the UI state
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
      toast.error(message);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      console.log('🔄 Orders: Cancelling order:', orderId);
      
      // First, get the order details to know the product and quantity
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, product_id, quantity, status')
        .eq('id', orderId)
        .single();
      
      if (orderError || !order) {
        throw new Error('Order not found');
      }
      
      // Only allow cancellation of pending orders
      if (order.status !== 'Pending') {
        throw new Error('Only pending orders can be cancelled');
      }
      
      // Update order status to cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'Cancelled',
          cancelled_by: userRole === 'vendor' ? 'vendor' : 'supplier',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (updateError) {
        throw new Error(`Failed to cancel order: ${updateError.message}`);
      }
      
      // Restore stock using the database function
      const { error: stockError } = await supabase
        .rpc('restore_product_stock', {
          p_product_id: order.product_id,
          p_quantity: order.quantity
        });
      
      if (stockError) {
        console.error('🔄 Orders: Failed to restore stock:', stockError);
        // Don't throw error here as the order is already cancelled
        // Just log the error for debugging
      } else {
        console.log('✅ Orders: Stock restored successfully for product:', order.product_id);
      }
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === orderId 
            ? { 
                ...o, 
                status: 'Cancelled',
                cancelled_by: userRole === 'vendor' ? 'vendor' : 'supplier',
                updated_at: new Date().toISOString()
              }
            : o
        )
      );
      
      toast.success('Order cancelled successfully');
      
      // Refresh orders to ensure consistency
      setTimeout(() => {
        fetchOrders();
      }, 500);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(message);
      toast.error(message);
    }
  };

  const getRecentSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          supplier:users!orders_supplier_id_fkey(
            id,
            name,
            role
          )
        `)
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique suppliers
      const uniqueSuppliers = data.reduce((acc: any[], order) => {
        const supplier = order.supplier;
        if (supplier && !acc.find(s => s.id === supplier.id)) {
          acc.push(supplier);
        }
        return acc;
      }, []);

      return uniqueSuppliers;
    } catch (err) {
      console.error('Error fetching recent suppliers:', err);
      return [];
    }
  };

  useEffect(() => {
    console.log('🔄 Orders: useEffect triggered with userId:', userId, 'userRole:', userRole);
    if (userId && userId.trim() !== '' && userRole) {
      console.log('🔄 Orders: Valid user ID and role, fetching orders...');
      fetchOrders();
    } else {
      console.log('🔄 Orders: No valid user ID or role, clearing orders...');
      console.log('🔄 Orders: userId:', userId, 'userRole:', userRole);
      // Clear orders if no valid userId
      setOrders([]);
      setLoading(false);
    }
  }, [userId, userRole]);

  return {
    orders,
    loading,
    error,
    placeOrder,
    updateOrderStatus,
    cancelOrder,
    getRecentSuppliers,
    refetch: fetchOrders
  };
};