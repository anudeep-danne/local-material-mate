import { useState, useEffect } from 'react';
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

  const fetchProducts = async () => {
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

      const { data, error } = await query.gt('stock', 0).order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useProducts: Error fetching products:', error);
        throw error;
      }
      
      console.log('📦 useProducts: Raw product data:', data);
      
      // Use the actual supplier data without overriding it
      const processedData = (data as Product[]).map(product => {
        console.log('🔍 useProducts: Processing product:', product.name, 'Supplier:', product.supplier);
        
        // Return the product with its actual supplier data
        // Each product will show its real creator's information
        return product;
      });
      
      console.log('✅ useProducts: Processed products:', processedData);
      setProducts(processedData);
    } catch (err) {
      console.error('❌ useProducts: Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  // Listen for account updates to refresh product data
  useEffect(() => {
    const handleAccountUpdate = (event: CustomEvent) => {
      console.log('🔄 Products: Account update received, refreshing products');
      fetchProducts();
    };

    const handleSupplierUpdate = (event: CustomEvent) => {
      console.log('🔄 Products: Supplier update received, refreshing products');
      fetchProducts();
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