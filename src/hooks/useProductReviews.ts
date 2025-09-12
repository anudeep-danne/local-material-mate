import { useState, useEffect } from 'react';

// Temporary stub for useProductReviews hook
export const useProductReviews = (userId?: string, userRole?: string) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProductRating = (productId: string) => {
    return 0;
  };

  const submitReview = async (reviewData: any) => {
    return false;
  };

  const deleteReview = async (reviewId: string) => {
    return false;
  };

  const hasReviewedProduct = async (userId: string, productId: string, orderId: string) => {
    return false;
  };

  return {
    reviews,
    loading,
    error,
    getProductRating,
    submitReview,
    deleteReview,
    hasReviewedProduct,
    refetch: () => {}
  };
};