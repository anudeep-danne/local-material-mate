import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type ConsumerOrder = Database['public']['Tables']['consumer_orders']['Row'] & {
  retailer: Database['public']['Tables']['users']['Row'];
  inventory: Database['public']['Tables']['retailer_inventory']['Row'] & {
    batch: Database['public']['Tables']['batches']['Row'] & {
      farmer: Database['public']['Tables']['users']['Row'];
    };
  };
};

export const useConsumerOrders = (userId: string | null, userRole: string) => {
  const [orders, setOrders] = useState<ConsumerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!userId) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('consumer_orders')
        .select(`
          *,
          retailer:users!consumer_orders_retailer_id_fkey(*),
          inventory:retailer_inventory!consumer_orders_inventory_id_fkey(
            *,
            batch:batches!retailer_inventory_batch_id_fkey(
              *,
              farmer:users!batches_farmer_id_fkey(*)
            )
          )
        `);

      if (userRole === 'consumer') {
        query = query.eq('consumer_id', userId);
      } else if (userRole === 'retailer') {
        query = query.eq('retailer_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as unknown as ConsumerOrder[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (orderData: {
    retailer_id: string;
    inventory_id: string;
    quantity: number;
    total_amount: number;
    delivery_address: string;
  }) => {
    try {
      if (!userId) throw new Error('No user ID');

      const { error } = await supabase
        .from('consumer_orders')
        .insert({
          consumer_id: userId,
          retailer_id: orderData.retailer_id,
          inventory_id: orderData.inventory_id,
          quantity: orderData.quantity,
          total_amount: orderData.total_amount,
          delivery_address: orderData.delivery_address,
          status: 'Pending'
        });

      if (error) throw error;
      
      // Update inventory quantity
      const { data: inventory } = await supabase
        .from('retailer_inventory')
        .select('quantity')
        .eq('id', orderData.inventory_id)
        .single();

      if (inventory) {
        const newQuantity = Math.max(0, inventory.quantity - orderData.quantity);
        await supabase
          .from('retailer_inventory')
          .update({ 
            quantity: newQuantity,
            status: newQuantity === 0 ? 'Out of Stock' : newQuantity < 10 ? 'Low Stock' : 'In Stock'
          })
          .eq('id', orderData.inventory_id);
      }
      
      toast.success('Order placed successfully!');
      await fetchOrders();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('consumer_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      
      await fetchOrders();
      toast.success('Order status updated!');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order';
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
    refetch: fetchOrders
  };
};