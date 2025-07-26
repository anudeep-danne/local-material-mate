import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, Package } from "lucide-react";

// Sample reviews data
const reviews = [
  {
    id: 1,
    vendorName: "Raj's Street Food",
    rating: 5,
    comment: "Excellent quality vegetables! Always fresh and delivered on time. Highly recommend Kumar Vegetables for all street food vendors.",
    date: "2024-01-18",
    orderNumber: "ORD001",
    product: "Fresh Tomatoes"
  },
  {
    id: 2,
    vendorName: "Mumbai Chaat Corner",
    rating: 4,
    comment: "Good quality onions. Pricing is competitive and delivery was prompt. Will continue ordering from them.",
    date: "2024-01-15",
    orderNumber: "ORD002",
    product: "Fresh Onions"
  },
  {
    id: 3,
    vendorName: "Delhi Dosa Hub",
    rating: 5,
    comment: "Amazing spice quality! The turmeric powder is pure and aromatic. Customer service is also very responsive.",
    date: "2024-01-12",
    orderNumber: "ORD003",
    product: "Turmeric Powder"
  },
  {
    id: 4,
    vendorName: "Street Food King",
    rating: 4,
    comment: "Quality is good but delivery was delayed by one day. Overall satisfied with the products.",
    date: "2024-01-10",
    orderNumber: "ORD004",
    product: "Basmati Rice"
  },
  {
    id: 5,
    vendorName: "Chaat Express",
    rating: 3,
    comment: "Average quality vegetables. Some items were not as fresh as expected. Room for improvement.",
    date: "2024-01-08",
    orderNumber: "ORD005",
    product: "Green Chilies"
  }
];

const SupplierReviews = () => {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SupplierSidebar />
        
        <main className="flex-1 bg-background">
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
                              width: `${((ratingCounts[rating] || 0) / totalReviews) * 100}%` 
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
                    <span className="font-semibold">{((ratingCounts[5] || 0) / totalReviews * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">4+ star reviews</span>
                    <span className="font-semibold">
                      {(((ratingCounts[5] || 0) + (ratingCounts[4] || 0)) / totalReviews * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recent reviews</span>
                    <span className="font-semibold">{reviews.filter(r => new Date(r.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week</span>
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
                            <h4 className="font-semibold">{review.vendorName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Order #{review.orderNumber} • {new Date(review.date).toLocaleDateString()}
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
                            {review.product}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SupplierReviews;