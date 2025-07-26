import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['users']['Row'] & {
  averageRating: number;
  totalReviews: number;
  productsCount: number;
  averagePrice: number;
  specialties: string[];
};

export const useSuppliers = (vendorId?: string) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      
      // Get all suppliers (users with role 'supplier')
      const { data: allSuppliers, error: suppliersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'supplier');

      if (suppliersError) throw suppliersError;

      // Get suppliers with detailed information
      const suppliersWithDetails = await Promise.all(
        allSuppliers.map(async (supplier) => {
          // Get reviews for this supplier
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('supplier_id', supplier.id);

          // Get products for this supplier
          const { data: products } = await supabase
            .from('products')
            .select('price, category')
            .eq('supplier_id', supplier.id);

          // Calculate ratings
          const ratings = reviews?.map(r => r.rating) || [];
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0;

          // Calculate product stats
          const prices = products?.map(p => p.price) || [];
          const averagePrice = prices.length > 0 
            ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
            : 0;

          // Get unique categories (specialties)
          const categories = products?.map(p => p.category) || [];
          const uniqueCategories = [...new Set(categories)];

          return {
            ...supplier,
            averageRating,
            totalReviews: ratings.length,
            productsCount: products?.length || 0,
            averagePrice,
            specialties: uniqueCategories
          };
        })
      );

      setSuppliers(suppliersWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRecentSuppliers = async () => {
    if (!vendorId) return [];
    
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
        .eq('vendor_id', vendorId)
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

      // Get full supplier details for recent suppliers
      const recentSuppliersWithDetails = await Promise.all(
        uniqueSuppliers.map(async (supplier) => {
          const fullSupplier = suppliers.find(s => s.id === supplier.id);
          return fullSupplier || supplier;
        })
      );

      return recentSuppliersWithDetails;
    } catch (err) {
      console.error('Error fetching recent suppliers:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    getRecentSuppliers,
    refetch: fetchSuppliers
  };
}; 