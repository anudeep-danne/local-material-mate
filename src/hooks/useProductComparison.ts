import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'] & {
  supplier: Database['public']['Tables']['users']['Row'];
};

export const useProductComparison = (supplierIds: string[]) => {
  const [products, setProducts] = useState<{ [supplierId: string]: Product[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsForSuppliers = async () => {
    try {
      setLoading(true);
      console.log('🔄 useProductComparison: Fetching products for suppliers:', supplierIds);
      
      const productsBySupplier: { [supplierId: string]: Product[] } = {};
      
      // Fetch products for each supplier
      for (const supplierId of supplierIds) {
        const { data, error } = await supabase
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
          `)
          .eq('supplier_id', supplierId)
          .gt('stock', 0)
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ useProductComparison: Error fetching products for supplier:', supplierId, error);
          throw error;
        }
        
        productsBySupplier[supplierId] = data as Product[];
      }
      
      console.log('✅ useProductComparison: Products by supplier:', productsBySupplier);
      setProducts(productsBySupplier);
    } catch (err) {
      console.error('❌ useProductComparison: Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplierIds.length > 0) {
      fetchProductsForSuppliers();
    } else {
      setProducts({});
      setLoading(false);
    }
  }, [JSON.stringify(supplierIds)]);

  // Get all unique product names across all suppliers
  const getAllProductNames = () => {
    const allNames = new Set<string>();
    Object.values(products).forEach(supplierProducts => {
      supplierProducts.forEach(product => {
        allNames.add(product.name);
      });
    });
    return Array.from(allNames).sort();
  };

  // Get product by name for a specific supplier
  const getProductByName = (supplierId: string, productName: string) => {
    return products[supplierId]?.find(product => product.name === productName);
  };

  return { 
    products, 
    loading, 
    error, 
    getAllProductNames, 
    getProductByName,
    refetch: fetchProductsForSuppliers 
  };
}; 