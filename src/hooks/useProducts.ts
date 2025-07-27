import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Product = Database['public']['Tables']['products']['Row'] & {
  supplier: {
    id: string;
    name: string;
    email: string;
    role: string;
    business_name: string;
    phone: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    description: string;
    created_at: string;
  };
};

interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
}

export const useProducts = (supplierId?: string, filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📦 useProducts: Fetching products with supplierId:', supplierId);
      console.log('📦 useProducts: Applied filters:', filters);

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
            city,
            state,
            pincode,
            latitude,
            longitude,
            description,
            created_at
          )
        `);

      // Apply supplier filter if provided
      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      // Apply category filter
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      // Apply search filter
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
      }

      // Apply price filters
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
      
      // Type assertion and validation
      const processedData = (data as Product[]).filter(product => {
        // Validate supplier data exists
        if (!product.supplier || typeof product.supplier !== 'object') {
          console.warn('⚠️ Product missing supplier data:', product.id);
          return false;
        }
        return true;
      });
      
      console.log('✅ useProducts: Processed products:', processedData);
      setProducts(processedData);
    } catch (err) {
      console.error('❌ useProducts: Error in fetchProducts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select();

      if (error) throw error;

      toast.success('Product added successfully!');
      await fetchProducts(); // Refresh the products list
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add product';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const updateProduct = async (productId: string, productData: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select();

      if (error) throw error;

      toast.success('Product updated successfully!');
      await fetchProducts(); // Refresh the products list
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product deleted successfully!');
      await fetchProducts(); // Refresh the products list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [supplierId, filters?.category, filters?.search, filters?.priceMin, filters?.priceMax]);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};