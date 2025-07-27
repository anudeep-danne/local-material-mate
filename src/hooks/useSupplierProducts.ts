import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Product = Database['public']['Tables']['products']['Row'];

export const useSupplierProducts = (supplierId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: {
    name: string;
    price: number;
    stock: number;
    category: string;
    image_url?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          ...productData,
          supplier_id: supplierId
        });

      if (error) throw error;
      toast.success('Product added successfully');
      await fetchProducts();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add product';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product updated successfully');
      await fetchProducts();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product deleted successfully');
      await fetchProducts();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (supplierId && supplierId.trim() !== '') {
      fetchProducts();
    } else {
      // Clear products if no valid supplierId
      setProducts([]);
      setLoading(false);
    }
  }, [supplierId]);

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