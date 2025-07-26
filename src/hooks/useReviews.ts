import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Review = Database['public']['Tables']['reviews']['Row'] & {
  vendor: Database['public']['Tables']['users']['Row'];
  supplier: Database['public']['Tables']['users']['Row'];
  order: Database['public']['Tables']['orders']['Row'] & {
    product: Database['public']['Tables']['products']['Row'];
  };
};

export const useReviews = (userId?: string, userRole?: 'vendor' | 'supplier') => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('reviews')
        .select(`
          *,
          vendor:users!reviews_vendor_id_fkey(*),
          supplier:users!reviews_supplier_id_fkey(*),
          order:orders!reviews_order_id_fkey(
            *,
            product:products!orders_product_id_fkey(*)
          )
        `);

      if (userId && userRole) {
        const column = userRole === 'vendor' ? 'vendor_id' : 'supplier_id';
        query = query.eq(column, userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as Review[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (reviewData: {
    orderId: string;
    vendorId: string;
    supplierId: string;
    rating: number;
    comment?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          order_id: reviewData.orderId,
          vendor_id: reviewData.vendorId,
          supplier_id: reviewData.supplierId,
          rating: reviewData.rating,
          comment: reviewData.comment
        });

      if (error) throw error;
      toast.success('Review submitted successfully');
      await fetchReviews();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const getSupplierStats = async (supplierId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('supplier_id', supplierId);

      if (error) throw error;

      const ratings = data.map(r => r.rating);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      return {
        totalReviews: ratings.length,
        averageRating: avgRating
      };
    } catch (err) {
      console.error('Error fetching supplier stats:', err);
      return { totalReviews: 0, averageRating: 0 };
    }
  };

  useEffect(() => {
    if (userId && userId.trim() !== '' && userRole) {
      fetchReviews();
    } else {
      // Clear reviews if no valid userId
      setReviews([]);
      setLoading(false);
    }
  }, [userId, userRole]);

  return {
    reviews,
    loading,
    error,
    submitReview,
    getSupplierStats,
    refetch: fetchReviews
  };
};