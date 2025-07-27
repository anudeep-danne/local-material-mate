import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, Package } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";

const SupplierReviews = () => {
  const { user } = useAuth();
  const supplierId = user?.id;
  const { reviews, loading, error, refetch } = useReviews(supplierId || "", 'supplier');

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  const totalReviews = reviews.length;
  
  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-success";
    if (rating >= 3) return "text-warning";
    return "text-destructive";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRecentReviewsCount = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return reviews.filter(review => new Date(review.created_at) > oneWeekAgo).length;
  };

  if (loading) {
    return (
      <>
        {/* Header */}
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-2xl font-semibold text-foreground">Reviews & Ratings</h1>
        </header>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-supplier-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Loading reviews...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Header */}
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-2xl font-semibold text-foreground">Reviews & Ratings</h1>
        </header>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-lg text-destructive mb-4">Error loading reviews</div>
            <div className="text-sm text-muted-foreground mb-4">{error}</div>
            <Button onClick={refetch}>Retry</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">Reviews & Ratings</h1>
          </header>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Rating Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-supplier-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-supplier-primary">Overall Rating</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-supplier-primary mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {totalReviews} reviews
                  </p>
                </CardContent>
              </Card>

              <Card className="border-supplier-primary/20">
                <CardHeader>
                  <CardTitle className="text-supplier-primary">Rating Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-3">{rating}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-supplier-primary h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${totalReviews > 0 ? ((ratingCounts[rating] || 0) / totalReviews) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          {ratingCounts[rating] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-supplier-primary/20">
                <CardHeader>
                  <CardTitle className="text-supplier-primary">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">5-star reviews</span>
                    <span className="font-semibold">
                      {totalReviews > 0 ? ((ratingCounts[5] || 0) / totalReviews * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">4+ star reviews</span>
                    <span className="font-semibold">
                      {totalReviews > 0 ? (((ratingCounts[5] || 0) + (ratingCounts[4] || 0)) / totalReviews * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recent reviews</span>
                    <span className="font-semibold">{getRecentReviewsCount()} this week</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Individual Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-supplier-secondary rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-supplier-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{review.vendor.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Order #{review.order.id.slice(0, 8)} • {formatDate(review.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            {renderStars(review.rating)}
                            <span className={`ml-2 text-sm font-semibold ${getRatingColor(review.rating)}`}>
                              {review.rating}/5
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <Package className="mr-1 h-3 w-3" />
                            {review.order.product?.name || 'Product'}
                          </Badge>
                        </div>
                      </div>
                      {review.comment && (
                      <p className="text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Reviews from vendors will appear here after they receive and rate your products.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      );
};

export default SupplierReviews;