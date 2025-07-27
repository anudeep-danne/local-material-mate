import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, CheckCircle, Package } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { useProductReviews } from "@/hooks/useProductReviews";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const VendorReviews = () => {
  // Get authenticated user ID
  const { user } = useAuth();
  const vendorId = user?.id;
  
  const { orders, getRecentSuppliers, getOrdersForSupplier } = useVendorOrders(vendorId);
  const { reviews: pastReviews, submitReview, deleteReview, loading: reviewsLoading, hasReviewedProduct } = useProductReviews(vendorId, 'vendor');
  
  const [recentSuppliers, setRecentSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<{[key: string]: boolean}>({});

  // Memoize supplier orders to prevent unnecessary recalculations
  const supplierOrders = useMemo(() => {
    return selectedSupplier ? getOrdersForSupplier(selectedSupplier) : [];
  }, [selectedSupplier, getOrdersForSupplier]);

  // Get unique products from vendor's orders for the selected supplier
  const uniqueProducts = useMemo(() => {
    if (!selectedSupplier) return [];
    
    const products = supplierOrders.map(order => ({
      product_id: order.product_id,
      product_name: order.product?.name || 'Unknown Product',
      order_id: order.id,
      created_at: order.created_at
    }));
    
    // Remove duplicates based on product_id, keeping the most recent order
    const uniqueMap = new Map();
    products.forEach(product => {
      if (!uniqueMap.has(product.product_id) || 
          new Date(product.created_at) > new Date(uniqueMap.get(product.product_id).created_at)) {
        uniqueMap.set(product.product_id, product);
      }
    });
    
    return Array.from(uniqueMap.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [supplierOrders, selectedSupplier]);

  // Memoize the fetch data function to prevent infinite re-renders
  const fetchData = useCallback(async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const suppliers = await getRecentSuppliers();
      setRecentSuppliers(suppliers);
      
      // Check review status for each unique product
      const status: {[key: string]: boolean} = {};
      for (const supplier of suppliers) {
        const supplierOrders = getOrdersForSupplier(supplier.id);
        
        // Get unique products for this supplier
        const products = supplierOrders.map(order => ({
          product_id: order.product_id,
          order_id: order.id
        }));
        
        const uniqueMap = new Map();
        products.forEach(product => {
          if (!uniqueMap.has(product.product_id)) {
            uniqueMap.set(product.product_id, product);
          }
        });
        
        for (const product of uniqueMap.values()) {
          const hasReviewed = await hasReviewedProduct(vendorId, product.product_id, product.order_id);
          status[`${supplier.id}-${product.product_id}`] = hasReviewed;
        }
      }
      setReviewStatus(status);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [vendorId, getRecentSuppliers, getOrdersForSupplier, hasReviewedProduct]);

  // Only fetch data when vendorId changes, not on every render
  useEffect(() => {
    if (vendorId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [vendorId]); // Remove fetchData from dependencies to prevent infinite loop

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    setSelectedOrder("");
    setRating(0);
    setComment("");
  };

  const handleOrderChange = (orderId: string) => {
    setSelectedOrder(orderId);
    setRating(0);
    setComment("");
  };

  const handleSubmit = async () => {
    if (!vendorId || !selectedSupplier || !selectedOrder || rating === 0 || !comment.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Get the product ID from the selected order
    const selectedOrderData = supplierOrders.find(order => order.id === selectedOrder);
    if (!selectedOrderData) {
      toast.error("Invalid order selected");
      return;
    }

    setSubmitting(true);
    
    try {
      const success = await submitReview({
        productId: selectedOrderData.product_id,
        orderId: selectedOrder,
        vendorId: vendorId,
        supplierId: selectedSupplier,
        rating: rating,
        comment: comment
      });

      if (success) {
        // Reset form
        setSelectedSupplier("");
        setSelectedOrder("");
        setRating(0);
        setComment("");
        
        // Update review status
        setReviewStatus(prev => ({
          ...prev,
          [`${selectedSupplier}-${selectedOrderData.product_id}`]: true
        }));
        
        // Refresh data after successful submission
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        const success = await deleteReview(reviewId);
        if (success) {
          // Refresh data after successful deletion
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer transition-colors ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300 hover:text-yellow-200"
        }`}
        onClick={interactive ? () => handleStarClick(i + 1) : undefined}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Product Reviews & Ratings</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading suppliers...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Check if user is authenticated
  if (!user || !vendorId) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Product Reviews & Ratings</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
                <p className="text-muted-foreground">
                  Please log in to access the reviews section.
                </p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <VendorSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">Product Reviews & Ratings</h1>
          </header>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Submit Review Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-vendor-primary">Submit a Product Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Supplier</label>
                    <Select value={selectedSupplier} onValueChange={handleSupplierChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {recentSuppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Order</label>
                    <Select value={selectedOrder} onValueChange={handleOrderChange} disabled={!selectedSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an order" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueProducts.map((product) => {
                          const isReviewed = reviewStatus[`${selectedSupplier}-${product.product_id}`];
                          return (
                            <SelectItem key={product.order_id} value={product.order_id} disabled={isReviewed}>
                              <div className="flex items-center justify-between w-full">
                                <span>{product.product_name}</span>
                                {isReviewed && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedOrder && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Product</label>
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {uniqueProducts.find(product => product.order_id === selectedOrder)?.product_name || 'Unknown Product'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Rating</label>
                      <div className="flex gap-1">
                        {renderStars(rating, true)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rating > 0 ? `${rating} out of 5 stars` : "Click to rate"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Review Comment</label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {comment.length}/500 characters
                      </p>
                    </div>

                    <Button 
                      onClick={handleSubmit} 
                      disabled={submitting || rating === 0 || !comment.trim()}
                      className="w-full"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Past Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-vendor-primary">Your Past Product Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading reviews...</p>
                  </div>
                ) : pastReviews.length > 0 ? (
                  <div className="space-y-4">
                    {pastReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{review.product_name}</h4>
                            <p className="text-sm text-muted-foreground">from {review.supplier_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                              <span className="text-sm text-muted-foreground ml-1">
                                ({review.rating}/5)
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          Reviewed on {formatDate(review.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">
                      Submit your first product review above to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default VendorReviews;