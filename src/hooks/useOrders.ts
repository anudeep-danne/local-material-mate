import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Order = Database['public']['Tables']['orders']['Row'] & {
  vendor: Database['public']['Tables']['users']['Row'];
  supplier: Database['public']['Tables']['users']['Row'];
  product: Database['public']['Tables']['products']['Row'];
};

export const useOrders = (userId: string, userRole: 'vendor' | 'supplier') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const column = userRole === 'vendor' ? 'vendor_id' : 'supplier_id';
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:users!orders_vendor_id_fkey(*),
          supplier:users!orders_supplier_id_fkey(*),
          product:products!orders_product_id_fkey(*)
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as Order[]);
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

  const updateOrderStatus = async (orderId: string, status: 'Pending' | 'Packed' | 'Delivered') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Order status updated to ${status}`);
      await fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
      toast.error(message);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      if (error) throw error;
      toast.success('Order cancelled successfully');
      await fetchOrders();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      fetchOrders();
    }
  }, [userId, userRole]);

  return {
    orders,
    loading,
    error,
    placeOrder,
    updateOrderStatus,
    cancelOrder,
    refetch: fetchOrders
  };
};