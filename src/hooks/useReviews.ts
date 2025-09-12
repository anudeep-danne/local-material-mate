import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Review = {
  id: string;
  product_id: string;
  supplier_id: string;
  vendor_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  vendor: Database['public']['Tables']['users']['Row'];
  supplier: Database['public']['Tables']['users']['Row'];
  product: Database['public']['Tables']['products']['Row'];
  order: Database['public']['Tables']['orders']['Row'];
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

export const useReviews = (userId?: string, userRole?: 'vendor' | 'supplier') => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('reviews')
        .select(`
          *,
          vendor:users!reviews_vendor_id_fkey(*),
          supplier:users!reviews_supplier_id_fkey(*),
          product:products!reviews_product_id_fkey(*),
          order:orders!reviews_order_id_fkey(*)
        `);

      if (userId && userRole) {
        const column = userRole === 'vendor' ? 'vendor_id' : 'supplier_id';
        query = query.eq(column, userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as unknown as Review[]);
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

      // Check if vendor has already reviewed this product for this order
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('vendor_id', reviewData.vendorId)
        .eq('product_id', reviewData.productId)
        .eq('order_id', reviewData.orderId)
        .limit(1);

      if (checkError) throw checkError;

      if (existingReview && existingReview.length > 0) {
        toast.error('You have already reviewed this product for this order');
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

      // Submit the review
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: reviewData.productId,
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

  const getProductRating = async (productId: string): Promise<ProductRating | null> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) throw error;

      const ratings = data.map(r => r.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      // Get product name separately
      const { data: productData } = await supabase
        .from('products')
        .select('name')
        .eq('id', productId)
        .single();

      return {
        productId,
        productName: productData?.name || 'Unknown Product',
        averageRating,
        totalReviews: ratings.length
      };
    } catch (err) {
      console.error('Error fetching product rating:', err);
      return null;
    }
  };

  const getSupplierRating = async (supplierId: string): Promise<SupplierRating | null> => {
    try {
      // Get all products for this supplier
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('supplier_id', supplierId);

      if (productsError) throw productsError;

      // Get average rating for each product
      const productRatings = await Promise.all(
        products.map(async (product) => {
          const rating = await getProductRating(product.id);
          return rating;
        })
      );

      // Calculate supplier average
      const validRatings = productRatings.filter(r => r !== null) as ProductRating[];
      const averageRating = validRatings.length > 0 
        ? validRatings.reduce((sum, r) => sum + r.averageRating, 0) / validRatings.length 
        : 0;

      const totalReviews = validRatings.reduce((sum, r) => sum + r.totalReviews, 0);

      return {
        supplierId,
        supplierName: 'Supplier', // This will be filled by the calling component
        averageRating,
        totalProducts: products.length,
        totalReviews
      };
    } catch (err) {
      console.error('Error fetching supplier rating:', err);
      return null;
    }
  };

  const hasReviewedProduct = async (vendorId: string, productId: string, orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('vendor_id', vendorId)
        .eq('product_id', productId)
        .eq('order_id', orderId)
        .limit(1);

      if (error) throw error;
      return data.length > 0;
    } catch (err) {
      console.error('Error checking review status:', err);
      return false;
    }
  };

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

  const getProductReviews = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          vendor:users!reviews_vendor_id_fkey(name),
          supplier:users!reviews_supplier_id_fkey(name),
          product:products!reviews_product_id_fkey(name),
          order:orders!reviews_order_id_fkey(id)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching product reviews:', err);
      return [];
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
  }, [userId, userRole, fetchReviews]);

  return {
    reviews,
    loading,
    error,
    submitReview,
    getProductRating,
    getSupplierRating,
    hasReviewedProduct,
    getVendorOrdersForSupplier,
    getProductReviews,
    refetch: fetchReviews
  };
};