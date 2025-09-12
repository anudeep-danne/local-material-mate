import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Review = {
  id: string;
  supplier_id: string;
  vendor_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export const useReviews = (userId?: string, userRole?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('reviews').select('*');

      if (userId && userRole) {
        if (userRole === 'vendor' || userRole === 'consumer' || userRole === 'distributor') {
          query = query.eq('vendor_id', userId);
        } else if (userRole === 'supplier' || userRole === 'farmer') {
          query = query.eq('supplier_id', userId);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  const submitReview = async (reviewData: {
    orderId: string;
    vendorId: string;
    supplierId: string;
    rating: number;
    comment?: string;
  }) => {
    try {
      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        toast.error('Please provide a valid rating between 1 and 5');
        return false;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          order_id: reviewData.orderId,
          vendor_id: reviewData.vendorId,
          supplier_id: reviewData.supplierId,
          rating: reviewData.rating,
          comment: reviewData.comment?.trim() || null
        });

      if (error) throw error;
      
      toast.success('Thank you for your review!');
      await fetchReviews();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (userId && userId.trim() !== '' && userRole) {
      fetchReviews();
    } else {
      setReviews([]);
      setLoading(false);
    }
  }, [userId, userRole, fetchReviews]);

  return {
    reviews,
    loading,
    error,
    submitReview,
    refetch: fetchReviews
  };
};