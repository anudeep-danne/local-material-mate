import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'] & {
  supplier: Database['public']['Tables']['users']['Row'];
};

export const useProducts = (filters?: {
  category?: string;
  supplierId?: string;
  priceMin?: number;
  priceMax?: number;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchRef = useRef<() => Promise<void>>();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 useProducts: Fetching products with filters:', filters);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          supplier:users!products_supplier_id_fkey(
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
        `);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.supplierId) {
        query = query.eq('supplier_id', filters.supplierId);
      }
      if (filters?.priceMin !== undefined) {
        query = query.gte('price', filters.priceMin);
      }
      if (filters?.priceMax !== undefined) {
        query = query.lte('price', filters.priceMax);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useProducts: Error fetching products:', error);
        throw error;
      }
      
      console.log('✅ useProducts: Fetched', data?.length || 0, 'products');
      
      // Temporary debug: Log first product structure
      if (data && data.length > 0) {
        console.log('🔍 useProducts: First product raw data:', data[0]);
      }
      
      // Use the actual supplier data without overriding it
      const processedData = (data as Product[]).map(product => {
        return product;
      });
      
      setProducts(processedData);
    } catch (err) {
      console.error('❌ useProducts: Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Store the fetch function in a ref to avoid dependency issues
  fetchRef.current = fetchProducts;

  useEffect(() => {
    fetchProducts();
    
    // Set up real-time subscription for product changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('🔄 useProducts: Product change detected:', payload);
          // Only refresh if the change is relevant (not just a timestamp update)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            if (fetchRef.current) {
              fetchRef.current();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Remove fetchProducts dependency to prevent infinite loops

  // Listen for account updates to refresh product data
  useEffect(() => {
    const handleAccountUpdate = (event: CustomEvent) => {
      console.log('🔄 Products: Account update received, refreshing products');
      if (fetchRef.current) {
        fetchRef.current();
      }
    };

    const handleSupplierUpdate = (event: CustomEvent) => {
      console.log('🔄 Products: Supplier update received, refreshing products');
      if (fetchRef.current) {
        fetchRef.current();
      }
    };

    window.addEventListener('accountUpdated', handleAccountUpdate as EventListener);
    window.addEventListener('supplierUpdated', handleSupplierUpdate as EventListener);

    return () => {
      window.removeEventListener('accountUpdated', handleAccountUpdate as EventListener);
      window.removeEventListener('supplierUpdated', handleSupplierUpdate as EventListener);
    };
  }, []);

  return { products, loading, error, refetch: fetchProducts };
};