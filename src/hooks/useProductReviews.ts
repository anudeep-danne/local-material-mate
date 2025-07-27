import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ProductReview = {
  id: string;
  supplier_id: string;
  vendor_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  vendor_name: string;
  supplier_name: string;
  product_name: string;
  product_id?: string; // Optional for backward compatibility
};

type ProductRating = {
  productId: string;
  productName: string;
  averageRating: number;
  totalReviews: number;
};

type SupplierRating = {
  supplierId: string;
  supplierName: string;
  averageRating: number;
  totalProducts: number;
  totalReviews: number;
};

export const useProductReviews = (userId?: string, userRole?: 'vendor' | 'supplier') => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use the existing reviews table structure
      let query = supabase
        .from('reviews')
        .select('*');

      if (userId && userRole) {
        const column = userRole === 'vendor' ? 'vendor_id' : 'supplier_id';
        query = query.eq(column, userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      // Transform the data to include related information
      const transformedReviews = await Promise.all(
        (data || []).map(async (review) => {
          // Get vendor name
          const { data: vendorData } = await supabase
            .from('users')
            .select('name')
            .eq('id', review.vendor_id)
            .single();

          // Get supplier name
          const { data: supplierData } = await supabase
            .from('users')
            .select('name')
            .eq('id', review.supplier_id)
            .single();

          // Get product name from the order
          let productName = 'Unknown Product';
          if (review.order_id) {
            const { data: orderData } = await supabase
              .from('orders')
              .select('product:products!orders_product_id_fkey(name)')
              .eq('id', review.order_id)
              .single();
            
            productName = orderData?.product?.name || 'Unknown Product';
          }

          return {
            ...review,
            vendor_name: vendorData?.name || 'Unknown Vendor',
            supplier_name: supplierData?.name || 'Unknown Supplier',
            product_name: productName
          };
        })
      );

      setReviews(transformedReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  const submitReview = async (reviewData: {
    productId: string;
    orderId: string;
    vendorId: string;
    supplierId: string;
    rating: number;
    comment?: string;
  }) => {
    try {
      // Validation
      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        toast.error('Please provide a valid rating between 1 and 5');
        return false;
      }

      if (!reviewData.comment || reviewData.comment.trim().length === 0) {
        toast.error('Please provide a review comment');
        return false;
      }

      // Check if vendor has already reviewed this specific product from this supplier
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('vendor_id', reviewData.vendorId)
        .eq('supplier_id', reviewData.supplierId)
        .eq('order_id', reviewData.orderId)
        .limit(1);

      if (checkError) throw checkError;

      if (existingReview && existingReview.length > 0) {
        toast.error('You have already reviewed this product from this supplier for this order');
        return false;
      }

      // Check if the order exists and belongs to the vendor
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, vendor_id, supplier_id, product_id')
        .eq('id', reviewData.orderId)
        .eq('vendor_id', reviewData.vendorId)
        .eq('supplier_id', reviewData.supplierId)
        .eq('product_id', reviewData.productId)
        .limit(1);

      if (orderError) throw orderError;

      if (!orderData || orderData.length === 0) {
        toast.error('Invalid order. Please select a valid order for this product.');
        return false;
      }

      // Submit the review (using current schema without product_id)
      const { error } = await supabase
        .from('reviews')
        .insert({
          order_id: reviewData.orderId,
          vendor_id: reviewData.vendorId,
          supplier_id: reviewData.supplierId,
          rating: reviewData.rating,
          comment: reviewData.comment.trim()
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

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      toast.success('Review deleted successfully');
      await fetchReviews();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete review';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const getProductRating = useCallback(async (productId: string, supplierId: string): Promise<ProductRating | null> => {
    try {
      // Get reviews for this specific product from this specific supplier
      // We need to join through orders to get reviews for this specific product
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          rating,
          order:orders!reviews_order_id_fkey(
            id,
            product_id,
            product:products!orders_product_id_fkey(
              id,
              name
            )
          )
        `)
        .eq('supplier_id', supplierId)
        .eq('order.product_id', productId);

      if (error) {
        console.error('Error fetching product reviews:', error);
        throw error;
      }

      // Filter out any reviews that don't have the correct product_id
      const validReviews = data.filter(review => 
        review.order && 
        review.order.product_id === productId
      );

      const ratings = validReviews.map(r => r.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      return {
        productId,
        productName: validReviews[0]?.order?.product?.name || 'Unknown Product',
        averageRating,
        totalReviews: ratings.length
      };
    } catch (err) {
      console.error('Error fetching product rating:', err);
      return null;
    }
  }, []);

  const getSupplierRating = async (supplierId: string): Promise<SupplierRating | null> => {
    try {
      // Get all reviews for this supplier
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('supplier_id', supplierId);

      if (reviewsError) throw reviewsError;

      const ratings = reviews.map(r => r.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      // Get total products for this supplier
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('supplier_id', supplierId);

      if (productsError) throw productsError;

      return {
        supplierId,
        supplierName: 'Supplier', // This will be filled by the calling component
        averageRating,
        totalProducts: products.length,
        totalReviews: ratings.length
      };
    } catch (err) {
      console.error('Error fetching supplier rating:', err);
      return null;
    }
  };

  const hasReviewedProduct = useCallback(async (vendorId: string, productId: string, orderId: string) => {
    try {
      // Check if vendor has reviewed this specific product from this supplier for this order
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('vendor_id', vendorId)
        .eq('order_id', orderId)
        .limit(1);

      if (error) {
        throw error;
      }
      
      return data.length > 0;
    } catch (err) {
      console.error('Error checking review status:', err);
      return false;
    }
  }, []);

  const getVendorOrdersForSupplier = async (vendorId: string, supplierId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          product:products!orders_product_id_fkey(
            id,
            name,
            price,
            category
          )
        `)
        .eq('vendor_id', vendorId)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching vendor orders for supplier:', err);
      return [];
    }
  };

  const getProductReviews = useCallback(async (productId: string, supplierId?: string) => {
    try {
      // Get reviews for this product through orders
      let query = supabase
        .from('reviews')
        .select(`
          *,
          order:orders!reviews_order_id_fkey(
            product:products!orders_product_id_fkey(name)
          )
        `)
        .eq('order.product_id', productId)
        .order('created_at', { ascending: false });

      // Add supplier filter if provided
      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to include related information
      const transformedReviews = await Promise.all(
        (data || []).map(async (review) => {
          // Get vendor name
          const { data: vendorData } = await supabase
            .from('users')
            .select('name')
            .eq('id', review.vendor_id)
            .single();

          // Get supplier name
          const { data: supplierData } = await supabase
            .from('users')
            .select('name')
            .eq('id', review.supplier_id)
            .single();

          return {
            ...review,
            vendor_name: vendorData?.name || 'Unknown Vendor',
            supplier_name: supplierData?.name || 'Unknown Supplier',
            product_name: review.order?.product?.name || 'Unknown Product'
          };
        })
      );

      return transformedReviews;
    } catch (err) {
      console.error('Error fetching product reviews:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (userId && userId.trim() !== '' && userRole) {
      fetchReviews();
    } else {
      // Clear reviews if no valid userId
      setReviews([]);
      setLoading(false);
    }
  }, [userId, userRole]); // Remove fetchReviews from dependencies to prevent infinite loop

  return {
    reviews,
    loading,
    error,
    submitReview,
    deleteReview,
    getProductRating,
    getSupplierRating,
    hasReviewedProduct,
    getVendorOrdersForSupplier,
    getProductReviews,
    refetch: fetchReviews
  };
}; 