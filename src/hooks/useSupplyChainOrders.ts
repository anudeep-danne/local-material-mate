import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupplyChainOrder {
  id: string;
  consumer_id: string;
  retailer_id: string;
  total_amount: number;
  status: string;
  address_json: any;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  inventory_id: string;
  batch_id: string;
  quantity: number;
  price_per_kg: number;
}

export const useSupplyChainOrders = (userId?: string) => {
  const [orders, setOrders] = useState<SupplyChainOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase.from('orders').select(`
        *,
        order_items(*)
      `).order('created_at', { ascending: false });
      
      if (userId) {
        query = query.or(`consumer_id.eq.${userId},retailer_id.eq.${userId}`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      setOrders(prev => prev.map(order => order.id === orderId ? data : order));
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
  }, [userId]);

  return {
    orders,
    loading,
    updateOrderStatus,
    refetch: fetchOrders
  };
};