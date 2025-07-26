import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useReviews } from "@/hooks/useReviews";
import { toast } from "sonner";

const VendorReviews = () => {
  // Using vendor ID for demo - in real app this would come from auth
  const vendorId = "11111111-1111-1111-1111-111111111111";
  const { getRecentSuppliers } = useSuppliers(vendorId);
  const { reviews: pastReviews, submitReview, loading: reviewsLoading } = useReviews(vendorId, 'vendor');
  const [recentSuppliers, setRecentSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchRecentSuppliers = async () => {
      const recent = await getRecentSuppliers();
      setRecentSuppliers(recent);
      setLoading(false);
    };
    fetchRecentSuppliers();
  }, [getRecentSuppliers]);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (selectedSupplier && rating > 0) {
      // Find the supplier object
      const supplier = recentSuppliers.find(s => s.id === selectedSupplier);
      if (!supplier) {
        toast.error("Supplier not found");
        return;
      }

      // For demo purposes, we'll use a mock order ID
      // In a real app, you'd get this from the actual order
      const mockOrderId = "mock-order-id";

      const success = await submitReview({
        orderId: mockOrderId,
        vendorId: vendorId,
        supplierId: supplier.id,
        rating: rating,
        comment: comment
      });

      if (success) {
        setSelectedSupplier("");
        setRating(0);
        setComment("");
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

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Reviews & Ratings</h1>
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <VendorSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">Reviews & Ratings</h1>
          </header>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Submit Review Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-vendor-primary">Submit a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Supplier</label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a supplier to review" />
                      </SelectTrigger>
                      <SelectContent>
                        {recentSuppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {recentSuppliers.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        No suppliers from recent orders found. Complete an order to review suppliers.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex gap-1">
                      {renderStars(rating, true)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review</label>
                  <Textarea
                    placeholder="Share your experience with this supplier..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  variant="vendor" 
                  onClick={handleSubmit}
                  disabled={!selectedSupplier || rating === 0 || recentSuppliers.length === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Review
                </Button>
              </CardContent>
            </Card>

            {/* Past Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Your Past Reviews</h2>
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading reviews...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{review.supplier.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Order #{review.order_id} • {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm font-semibold">{review.rating}/5</span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {pastReviews.length === 0 && (
                <div className="text-center py-12">
                  <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Complete your first order to start reviewing suppliers.
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

export default VendorReviews;