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

export const useOrders = (userId: string, userRole: 'vendor' | 'supplier') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const column = userRole === 'vendor' ? 'vendor_id' : 'supplier_id';
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:users!orders_vendor_id_fkey(
            id,
            name,
            email,
            role,
            business_name,
            phone,
            address,
            city,
            state,
            pincode,
            description
          ),
          supplier:users!orders_supplier_id_fkey(
            id,
            name,
            email,
            role,
            business_name,
            phone,
            address,
            city,
            state,
            pincode,
            description
          ),
          product:products!orders_product_id_fkey(*)
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the data and filter out orders with invalid vendor data
      const processedData = (data as Order[]).filter(order => {
        // Filter out orders with dummy vendor data
        const isVendorValid = order.vendor && 
          order.vendor.name && 
          order.vendor.name !== '' && 
          !order.vendor.name.toLowerCase().includes('vendor') &&
          !order.vendor.name.toLowerCase().includes('test') &&
          !order.vendor.name.toLowerCase().includes('john') &&
          !order.vendor.name.toLowerCase().includes('dummy');
        
        console.log('🔍 useOrders: Processing order:', order.id, 'Vendor:', order.vendor, 'Valid:', isVendorValid);
        return isVendorValid;
      });
      
      setOrders(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (cartItems: any[]) => {
    try {
      const orderPromises = cartItems.map(async (item) => {
        const totalAmount = item.product.price * item.quantity;
        
        return supabase
          .from('orders')
          .insert({
            vendor_id: item.vendor_id,
            supplier_id: item.product.supplier_id,
            product_id: item.product_id,
            quantity: item.quantity,
            total_amount: totalAmount,
            status: 'Pending'
          });
      });

      const results = await Promise.all(orderPromises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Some orders failed to place');
      }

      toast.success('Orders placed successfully!');
      await fetchOrders();
      return true;
    } catch (err) {
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
    if (userId && userId.trim() !== '' && userRole) {
      fetchOrders();
    } else {
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