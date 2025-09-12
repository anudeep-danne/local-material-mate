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
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
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
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      setOrders(data as Order[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  const getRecentSuppliers = useCallback(async () => {
    if (!vendorId) return [];

    try {
      // Get unique suppliers from recent orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          supplier_id,
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
          )
        `)
        .eq('vendor_id', vendorId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique suppliers
      const uniqueSuppliers = data.reduce((acc: any[], order: any) => {
        const existing = acc.find(s => s.id === order.supplier.id);
        if (!existing) {
          acc.push(order.supplier);
        }
        return acc;
      }, []);

      return uniqueSuppliers;
    } catch (err) {
      console.error('Error fetching recent suppliers:', err);
      return [];
    }
  }, [vendorId]);

  const getOrdersForSupplier = useCallback((supplierId: string) => {
    return orders.filter(order => order.supplier_id === supplierId);
  }, [orders]);

  const hasReviewedSupplier = useCallback(async (supplierId: string) => {
    if (!vendorId) return false;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('vendor_id', vendorId)
        .eq('supplier_id', supplierId)
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