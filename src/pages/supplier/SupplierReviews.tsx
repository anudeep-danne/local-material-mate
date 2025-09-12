import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Package, TrendingUp, AlertCircle, MessageSquare } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const SupplierReviews = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const supplierId = user?.id;
  
  const [supplierRating, setSupplierRating] = useState<{
    supplierId: string;
    supplierName: string;
    averageRating: number;
    totalProducts: number;
    totalReviews: number;
  } | null>(null);
  const [loadingRating, setLoadingRating] = useState(true);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch data function to prevent infinite re-renders
  const fetchData = useCallback(async () => {
    if (!supplierId) {
      setLoadingRating(false);
      return;
    }
    
    try {
      setLoadingRating(true);
      setError(null);
      
      console.log('Starting to fetch supplier reviews data...');
      
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Step 1: Get all reviews for this supplier (simple query first)
      console.log('Fetching all reviews for supplier:', supplierId);
      const { data: allReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('to_user_id', supplierId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
      }

      console.log(`Found ${allReviews?.length || 0} reviews for supplier ${supplierId}`);
      
      // Step 2: Calculate supplier rating from all reviews
      let averageRating = 0;
      let totalReviews = 0;
      
      if (allReviews && allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / allReviews.length;
        totalReviews = allReviews.length;
      }
      
      // Step 3: Get products for this supplier (for product count)
      console.log('Fetching products for supplier:', supplierId);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('supplier_id', supplierId);

      if (productsError) {
        console.error('Error fetching products:', productsError);
        // Don't throw error, just log it and continue
      }

      console.log(`Found ${products?.length || 0} products for supplier ${supplierId}`);
      
      // Step 4: Set supplier rating
      setSupplierRating({
        supplierId,
        supplierName: 'Supplier',
        averageRating,
        totalProducts: products?.length || 0,
        totalReviews
      });
      
      // Step 5: Transform reviews with vendor names and product information
      console.log('Transforming reviews...');
      const transformedReviews: any[] = [];
      
      if (allReviews && allReviews.length > 0) {
        for (const review of allReviews) {
          try {
            // Get vendor name
            const { data: vendorData, error: vendorError } = await supabase
              .from('users')
              .select('name')
              .eq('id', review.from_user_id)
              .single();

            if (vendorError) {
              console.error('Error fetching vendor data:', vendorError);
            }

            // Skip order and product information for simplified reviews
            const orderData = null;

            // Skip order error handling for simplified reviews

            // Determine product name
            let productName = 'General Review';
            let productId = null;

            const transformedReview = {
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              created_at: review.created_at,
              from_user_id: review.from_user_id,
              vendor_name: vendorData?.name || 'Unknown Vendor',
              supplier_name: 'Supplier',
              product_name: productName,
              product_id: productId
            };
            
            console.log(`Transformed review: ${transformedReview.id} for product ${transformedReview.product_name} by ${transformedReview.vendor_name}`);
            transformedReviews.push(transformedReview);
          } catch (error) {
            console.error('Error transforming review:', error);
            // Skip this review if there's an error, but continue with others
          }
        }
      }
      
      console.log(`Total reviews after transformation: ${transformedReviews.length}`);
      
      // Step 6: Remove duplicates based on review ID
      const uniqueReviews = transformedReviews.filter((review, index, self) => 
        index === self.findIndex(r => r.id === review.id)
      );
      
      console.log(`Total unique reviews: ${uniqueReviews.length}`);
      console.log('Final unique reviews:', uniqueReviews.map(r => ({ id: r.id, product: r.product_name, vendor: r.vendor_name })));
      
      setProductReviews(uniqueReviews);
      
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Set default values on error
      setSupplierRating({
        supplierId,
        supplierName: 'Supplier',
        averageRating: 0,
        totalProducts: 0,
        totalReviews: 0
      });
      setProductReviews([]);
    } finally {
      setLoadingRating(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return [...Array(5)].map((_, i) => {
      let starClass = "text-gray-300";
      if (i < fullStars) {
        starClass = "text-yellow-400 fill-current";
      } else if (i === fullStars && hasHalfStar) {
        starClass = "text-yellow-400 fill-current";
      }
      
      return (
        <Star key={i} className={`h-4 w-4 ${starClass}`} />
      );
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  const MobileOverallRating = () => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-supplier-primary">Your Overall Rating</CardTitle>
      </CardHeader>
      <CardContent>
        {supplierRating ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-supplier-primary">
                {supplierRating.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mt-2">
                {renderStars(supplierRating.averageRating)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {supplierRating.totalReviews} review{supplierRating.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-bold text-supplier-primary">
                  {supplierRating.totalProducts}
                </div>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-bold text-supplier-primary">
                  {supplierRating.totalReviews}
                </div>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-medium mb-2">No ratings yet</h3>
            <p className="text-sm text-muted-foreground">
              Start selling products to receive reviews from vendors.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const DesktopOverallRating = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-supplier-primary">Your Overall Rating</CardTitle>
      </CardHeader>
      <CardContent>
        {supplierRating ? (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-supplier-primary">
                {supplierRating.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mt-2">
                {renderStars(supplierRating.averageRating)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {supplierRating.totalReviews} review{supplierRating.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-supplier-primary">
                    {supplierRating.totalProducts}
                  </div>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-supplier-primary">
                    {supplierRating.totalReviews}
                  </div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No ratings yet</h3>
            <p className="text-muted-foreground">
              Start selling products to receive reviews from vendors.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const MobileRatingDistribution = () => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Rating Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star as keyof typeof ratingDistribution];
            const percentage = supplierRating && supplierRating.totalReviews > 0 
              ? (count / supplierRating.totalReviews) * 100 
              : 0;
            
            return (
              <div key={star} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-xs font-medium">{star}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const DesktopRatingDistribution = () => (
    <Card>
      <CardHeader>
        <CardTitle>Rating Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star as keyof typeof ratingDistribution];
            const percentage = supplierRating && supplierRating.totalReviews > 0 
              ? (count / supplierRating.totalReviews) * 100 
              : 0;
            
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{star}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const MobileReviewCard = ({ review }: { review: any }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{review.product_name}</h4>
          <p className="text-xs text-muted-foreground">
            by {review.vendor_name}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {renderStars(review.rating)}
          <span className={`text-xs font-medium ml-1 ${getRatingColor(review.rating)}`}>
            {review.rating}
          </span>
        </div>
      </div>
      
      {review.comment && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              "{review.comment}"
            </p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>Order #{review.order_id?.slice(0, 8) || 'Unknown'}</span>
        <span>{formatDate(review.created_at)}</span>
      </div>
    </div>
  );

  const DesktopReviewCard = ({ review }: { review: any }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium">{review.product_name}</h4>
          <p className="text-sm text-muted-foreground">
            Reviewed by {review.vendor_name}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
          <span className={`text-sm font-medium ml-1 ${getRatingColor(review.rating)}`}>
            ({review.rating}/5)
          </span>
        </div>
      </div>
      
      {review.comment && (
        <p className="text-sm text-muted-foreground mb-3">
          "{review.comment}"
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Order #{review.order_id?.slice(0, 8) || 'Unknown'}</span>
        <span>{formatDate(review.created_at)}</span>
      </div>
    </div>
  );

  if (loadingRating) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SupplierSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">Reviews & Ratings</h1>
            </header>
            <div className="p-4 md:p-6">
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-supplier-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading reviews...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SupplierSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">Reviews & Ratings</h1>
            </header>
            <div className="p-4 md:p-6">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Reviews</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button 
                  onClick={fetchData}
                  className="px-4 py-2 bg-supplier-primary text-white rounded-md hover:bg-supplier-primary/90"
                >
                  Try Again
                </button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Reviews & Ratings</h1>
      </header>
      
      {/* Content */}
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Overall Rating Card */}
        {isMobile ? <MobileOverallRating /> : <DesktopOverallRating />}

        {/* Rating Distribution */}
        {supplierRating && supplierRating.totalReviews > 0 && (
          isMobile ? <MobileRatingDistribution /> : <DesktopRatingDistribution />
        )}

        {/* Product Reviews */}
        <Card>
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl text-supplier-primary">Product Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {productReviews.length > 0 ? (
              <div className="space-y-4 md:space-y-6">
                {productReviews.map((review) => (
                  <div key={review.id}>
                    {isMobile ? (
                      <MobileReviewCard review={review} />
                    ) : (
                      <DesktopReviewCard review={review} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <Package className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No product reviews yet</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Vendors will be able to review your products after placing orders.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupplierReviews;