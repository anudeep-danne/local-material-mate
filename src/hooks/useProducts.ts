import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'] & {
  supplier: Database['public']['Tables']['users']['Row'] & {
    averageRating?: number;
    totalReviews?: number;
  };
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
      let query = supabase
        .from('products')
        .select(`
          *,
          supplier:users!products_supplier_id_fkey(*)
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

      if (error) throw error;
      
      // Fetch supplier ratings
      const productsWithRatings = await Promise.all(
        (data as Product[]).map(async (product) => {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('supplier_id', product.supplier.id);

          const ratings = reviews?.map(r => r.rating) || [];
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0;

          return {
            ...product,
            supplier: {
              ...product.supplier,
              averageRating,
              totalReviews: ratings.length
            }
          };
        })
      );

      setProducts(productsWithRatings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error, refetch: fetchProducts };
};