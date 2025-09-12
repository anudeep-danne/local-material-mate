import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  supplier: Database['public']['Tables']['users']['Row'];
  product: Database['public']['Tables']['products']['Row'];
};

export const useVendorOrders = (vendorId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!vendorId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // For now, return empty array since orders schema has changed
      setOrders([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  const getRecentSuppliers = useCallback(async () => {
    if (!vendorId) return [];

    try {
      // For now, return empty array since orders schema has changed
      return [];
    } catch (err) {
      console.error('Error fetching recent suppliers:', err);
      return [];
    }
  }, [vendorId]);

  const getOrdersForSupplier = useCallback((supplierId: string) => {
    return orders.filter(order => order.supplier?.id === supplierId);
  }, [orders]);

  const hasReviewedSupplier = useCallback(async (supplierId: string) => {
    if (!vendorId) return false;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('from_user_id', vendorId)
        .eq('to_user_id', supplierId)
        .limit(1);

      if (error) throw error;
      return data.length > 0;
    } catch (err) {
      console.error('Error checking review status:', err);
      return false;
    }
  }, [vendorId]);

  useEffect(() => {
    if (vendorId) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [vendorId]); // Remove fetchOrders from dependencies to prevent infinite loop

  return {
    orders,
    loading,
    error,
    getRecentSuppliers,
    getOrdersForSupplier,
    hasReviewedSupplier,
    refetch: fetchOrders
  };
}; 