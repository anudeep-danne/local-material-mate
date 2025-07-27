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

  // Listen for account updates to refresh orders
  useEffect(() => {
    const handleAccountUpdate = (event: CustomEvent) => {
      console.log('🔄 Orders: Account update received, refreshing orders');
      fetchOrders();
    };

    const handleSupplierUpdate = (event: CustomEvent) => {
      console.log('🔄 Orders: Supplier update received, refreshing orders');
      fetchOrders();
    };

    window.addEventListener('accountUpdated', handleAccountUpdate as EventListener);
    window.addEventListener('supplierUpdated', handleSupplierUpdate as EventListener);

    return () => {
      window.removeEventListener('accountUpdated', handleAccountUpdate as EventListener);
      window.removeEventListener('supplierUpdated', handleSupplierUpdate as EventListener);
    };
  }, [userId, userRole]);

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
            console.log('🔄 Orders: Real-time order change detected:', payload.eventType);
            console.log('🔄 Orders: Payload new:', payload.new);
            console.log('🔄 Orders: Payload old:', payload.old);
            
            // Only refresh if the change affects this user's orders
            const order = payload.new || payload.old;
            if (order && typeof order === 'object') {
              const orderData = order as any;
              const isRelevant = userRole === 'vendor' 
                ? orderData.vendor_id === userId 
                : orderData.supplier_id === userId;
              
              console.log('🔄 Orders: Order data:', {
                orderId: orderData.id,
                status: orderData.status,
                accepted_by: orderData.accepted_by,
                cancelled_by: orderData.cancelled_by,
                vendor_id: orderData.vendor_id,
                supplier_id: orderData.supplier_id,
                currentUserId: userId,
                userRole: userRole,
                isRelevant: isRelevant
              });
              
              if (isRelevant) {
                console.log('🔄 Orders: Relevant order change, refreshing orders...');
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
      
      // Debug: Log the first few orders to see their status
      if (data && data.length > 0) {
        console.log('🔄 Orders: Sample order data:');
        data.slice(0, 3).forEach((order, index) => {
          console.log(`  Order ${index + 1}:`, {
            id: order.id,
            status: order.status,
            accepted_by: order.accepted_by,
            cancelled_by: order.cancelled_by,
            vendor_id: order.vendor_id,
            supplier_id: order.supplier_id
          });
        });
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
      
      const orderPromises = cartItems.map(async (item) => {
        const totalAmount = item.product.price * item.quantity;
        
        console.log('🔄 Orders: Creating order for item:', {
          vendor_id: item.vendor_id,
          supplier_id: item.product.supplier_id,
          product_id: item.product_id,
          quantity: item.quantity,
          total_amount: totalAmount,
          status: 'Pending'
        });
        
        return supabase
          .from('orders')
          .insert({
            vendor_id: item.vendor_id,
            supplier_id: item.product.supplier_id,
            product_id: item.product_id,
            quantity: item.quantity,
            total_amount: totalAmount,
            status: 'Pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      });

      const results = await Promise.all(orderPromises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('🔄 Orders: Order placement errors:', errors);
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

  const updateOrderStatus = async (orderId: string, status: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled') => {
    try {
      console.log('🔄 Orders: Updating order status:', orderId, 'to:', status, 'User role:', userRole);
      console.log('🔄 Orders: User ID:', userId);
      console.log('🔄 Orders: Authentication check - User ID valid:', !!userId && userId.trim() !== '');
      
      // Check if we have a valid user ID
      if (!userId || userId.trim() === '') {
        throw new Error('No valid user ID found. Please log in again.');
      }
      
      // Prepare update data based on status and user role
      const updateData: any = {
        status: status,
        updated_at: new Date().toISOString()
      };
      
      // Set appropriate fields based on status and user role
      if (status === 'Cancelled') {
        updateData.cancelled_by = userRole === 'vendor' ? 'vendor' : 'supplier';
        updateData.accepted_by = null; // Clear accepted_by when cancelled
      } else if ((status === 'Pending' || status === 'Confirmed') && userRole === 'supplier') {
        updateData.accepted_by = 'supplier';
        updateData.cancelled_by = null; // Clear cancelled_by when accepted
      } else {
        // For other status updates, clear both fields
        updateData.cancelled_by = null;
        updateData.accepted_by = null;
      }
      
      console.log('🔄 Orders: Update data:', updateData);
      console.log('🔄 Orders: Executing database update...');
      
      let { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Failed to update order status:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        throw error;
      }
      
      console.log('✅ Order status updated successfully:', data);
      console.log('✅ Updated order details:', {
        id: data?.[0]?.id,
        status: data?.[0]?.status,
        accepted_by: data?.[0]?.accepted_by,
        cancelled_by: data?.[0]?.cancelled_by
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: status,
                cancelled_by: updateData.cancelled_by,
                accepted_by: updateData.accepted_by,
                updated_at: new Date().toISOString()
              }
            : order
        )
      );
      
      // Show appropriate success message
      let successMessage = `Order status updated to ${status}`;
      if (status === 'Cancelled') {
        successMessage = `Order cancelled by ${userRole}`;
      } else if ((status === 'Pending' || status === 'Confirmed') && userRole === 'supplier') {
        successMessage = 'Order accepted by supplier';
      }
      
      toast.success(successMessage);
      
    } catch (err) {
      console.error('❌ Exception in updateOrderStatus:', err);
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
      toast.error(message);
      throw err; // Re-throw to allow calling function to handle
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      console.log('🔄 Orders: Cancelling order:', orderId, 'User role:', userRole);
      
      // Use the same logic as updateOrderStatus for consistency
      const updateData = {
        status: 'Cancelled',
        cancelled_by: userRole === 'vendor' ? 'vendor' : 'supplier',
        accepted_by: null, // Clear accepted_by when cancelled
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 Orders: Cancel data:', updateData);
      
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Failed to cancel order:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        throw error;
      }
      
      console.log('✅ Order cancelled successfully:', data);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: 'Cancelled', 
                cancelled_by: userRole === 'vendor' ? 'vendor' : 'supplier',
                accepted_by: null,
                updated_at: new Date().toISOString()
              }
            : order
        )
      );
      
      toast.success(`Order cancelled by ${userRole}`);
      
    } catch (err) {
      console.error('❌ Exception in cancelOrder:', err);
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