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
      
      if (!cartItems || cartItems.length === 0) {
        toast.error('No items in cart');
        return false;
      }
      
      const orderPromises = cartItems.map(async (item) => {
        const totalAmount = item.product.price * item.quantity;
        const supplierId = item.product.supplier?.id;
        
        if (!supplierId) {
          console.error('🔄 Orders: Missing supplier ID for item:', item);
          throw new Error('Supplier information missing');
        }
        
        console.log('🔄 Orders: Creating order for item:', {
          vendor_id: item.vendor_id,
          supplier_id: supplierId,
          product_id: item.product_id,
          quantity: item.quantity,
          total_amount: totalAmount,
          status: 'Pending'
        });
        
        return supabase
          .from('orders')
          .insert({
            vendor_id: item.vendor_id,
            supplier_id: supplierId,
            product_id: item.product_id,
            quantity: item.quantity,
            total_amount: totalAmount,
            status: 'Pending'
          });
      });

      const results = await Promise.all(orderPromises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('🔄 Orders: Order placement errors:', errors);
        errors.forEach(error => console.error('Order error:', error.error));
        throw new Error('Some orders failed to place');
      }

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

  // Update order status and reduce stock if needed
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Orders: Updating order status:', orderId, 'to:', newStatus);
      
      // Fetch the order to get current status, product_id, quantity
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (orderError || !order) throw orderError || new Error('Order not found');

      // Reduce stock when status is set to 'Packed'
      if (newStatus === 'Packed') {
        // Fetch the product to get current stock
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', order.product_id)
          .single();
        if (productError || !product) throw productError || new Error('Product not found');
        const newStock = Math.max(0, product.stock - order.quantity);
        // Update product stock
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', order.product_id);
        if (stockError) throw stockError;
      }
      
      // Update order status with explicit updated_at timestamp
      const { error: statusError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (statusError) throw statusError;
      
      console.log('🔄 Orders: Order status updated successfully:', orderId, 'to:', newStatus);
      
      // Refresh orders to show the updated status
      await fetchOrders();
      return true;
    } catch (err) {
      console.error('🔄 Orders: Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      return false;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      console.log('🔄 Orders: Cancelling order:', orderId, 'User role:', userRole);
      
      if (!userId || userId.trim() === '') {
        throw new Error('No valid user ID found. Please log in again.');
      }

      // Prepare update data
      const updateData = {
        status: 'Cancelled',
        cancelled_by: userRole === 'vendor' ? 'vendor' : 'supplier',
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Orders: Update data for cancellation:', updateData);

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('❌ Failed to cancel order:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        throw error;
      }

      console.log('✅ Order cancelled successfully');
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: 'Cancelled', 
                cancelled_by: userRole === 'vendor' ? 'vendor' : 'supplier',
                updated_at: new Date().toISOString()
              }
            : order
        )
      );
      
      toast.success('Order cancelled successfully');
      
    } catch (err) {
      console.error('❌ Exception in cancelOrder:', err);
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(message);
      toast.error(message);
      throw err; // Re-throw to allow calling function to handle
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