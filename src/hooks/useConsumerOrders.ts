import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type ConsumerOrder = Tables<'consumer_orders'>;
type ConsumerOrderInsert = TablesInsert<'consumer_orders'>;
type ConsumerOrderUpdate = TablesUpdate<'consumer_orders'>;

export const useConsumerOrders = (userId?: string, userRole?: string) => {
  const [orders, setOrders] = useState<ConsumerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase.from('consumer_orders').select(`
        *,
        inventory:retailer_inventory(*),
        retailer:users!consumer_orders_retailer_id_fkey(name, business_name),
        consumer:users!consumer_orders_consumer_id_fkey(name, business_name)
      `).order('created_at', { ascending: false });
      
      if (userId && userRole) {
        if (userRole === 'consumer') {
          query = query.eq('consumer_id', userId);
        } else if (userRole === 'retailer') {
          query = query.eq('retailer_id', userId);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching consumer orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<ConsumerOrderInsert, 'consumer_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('consumer_orders')
        .insert({
          ...orderData,
          consumer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setOrders(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Order placed successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('consumer_orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOrders(prev => prev.map(order => order.id === id ? data : order));
      toast({
        title: "Success",
        description: "Order status updated successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId, userRole]);

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};