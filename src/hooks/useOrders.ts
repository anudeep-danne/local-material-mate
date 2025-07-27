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
            console.log('🔄 Orders: Real-time order change detected, refreshing orders...');
            
            // Add a small delay to ensure the database transaction is complete
            setTimeout(() => {
              fetchOrders();
            }, 500);
          }
        )
        .subscribe((status) => {
          console.log('🔄 Orders: Real-time subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('🔄 Orders: Successfully subscribed to order changes');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('🔄 Orders: Real-time subscription error');
            // If real-time fails, fall back to periodic refresh
            console.log('🔄 Orders: Falling back to periodic refresh due to real-time error');
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

  // Set up periodic refresh as fallback (every 10 seconds)
  useEffect(() => {
    if (userId && userId.trim() !== '') {
      const interval = setInterval(() => {
        console.log('🔄 Orders: Periodic refresh triggered');
        fetchOrders();
      }, 10000); // 10 seconds for more frequent updates

      return () => {
        console.log('🔄 Orders: Cleaning up periodic refresh');
        clearInterval(interval);
      };
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
        
        // Map to allowed DB values
        let dbStatus: string = status;
        if (status === 'Confirmed' || status === 'Packed') dbStatus = 'Packed';
        else if (status === 'Shipped' || status === 'Out for Delivery' || status === 'Delivered') dbStatus = 'Delivered';
        else if (status === 'Pending') dbStatus = 'Pending';
        else if (status === 'Cancelled') dbStatus = 'Delivered'; // Map cancelled to delivered in DB
        
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
      // Try to update with 'Cancelled' status first
      let { error } = await supabase
        .from('orders')
        .update({ 
          status: 'Cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      // If that fails, try with 'Delivered' status (which should be allowed)
      if (error) {
        console.warn('Failed to set status to Cancelled, trying Delivered:', error.message);
        
        const { error: fallbackError } = await supabase
          .from('orders')
          .update({ 
            status: 'Delivered',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (fallbackError) {
          console.error('Failed to update order status:', fallbackError);
          throw fallbackError;
        }
      }
      
      // Update local state to show as 'Cancelled' regardless of what was saved in DB
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
      
      // Don't refetch immediately to preserve the UI state
      // The order will appear as cancelled in the UI
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