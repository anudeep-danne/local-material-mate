import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send } from "lucide-react";
import { useState } from "react";

// Sample reviews data
const pastReviews = [
  {
    id: 1,
    supplier: "Kumar Vegetables",
    rating: 4,
    comment: "Fresh vegetables, good quality. Delivery was on time.",
    date: "2024-01-15",
    order: "ORD001"
  },
  {
    id: 2,
    supplier: "Sharma Traders",
    rating: 5,
    comment: "Excellent quality tomatoes and quick delivery. Highly recommended!",
    date: "2024-01-10",
    order: "ORD002"
  },
  {
    id: 3,
    supplier: "Patel Oil Mills",
    rating: 3,
    comment: "Good oil quality but delivery was delayed by a day.",
    date: "2024-01-05",
    order: "ORD003"
  }
];

const suppliers = [
  "Kumar Vegetables",
  "Sharma Traders", 
  "Patel Oil Mills",
  "Gupta Spices"
];

const VendorReviews = () => {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = () => {
    if (selectedSupplier && rating > 0) {
      // Handle review submission
      console.log("Review submitted:", { selectedSupplier, rating, comment });
      setSelectedSupplier("");
      setRating(0);
      setComment("");
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
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier} value={supplier}>
                            {supplier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  disabled={!selectedSupplier || rating === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Review
                </Button>
              </CardContent>
            </Card>

            {/* Past Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Your Past Reviews</h2>
              <div className="space-y-4">
                {pastReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{review.supplier}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{review.order} • {new Date(review.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm font-semibold">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

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