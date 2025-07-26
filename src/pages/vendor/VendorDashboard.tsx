import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Star, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useState, useEffect } from "react";

const VendorDashboard = () => {
  const navigate = useNavigate();
  // Using vendor ID for demo - in real app this would come from auth
  const vendorId = "11111111-1111-1111-1111-111111111111";
  const { suppliers, loading } = useSuppliers(vendorId);
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);

  useEffect(() => {
    if (suppliers.length > 0) {
      // Sort suppliers by rating and take top 5
      const sorted = [...suppliers]
        .filter(s => s.averageRating > 0)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);
      setTopSuppliers(sorted);
    }
  }, [suppliers]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
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
            <h1 className="text-2xl font-semibold text-foreground">Vendor Dashboard</h1>
          </header>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Welcome back, Vendor!</h2>
              <p className="text-muted-foreground">Here's what's happening with your orders and suppliers today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <Package className="h-4 w-4 text-vendor-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-vendor-primary">8</div>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                </CardContent>
              </Card>

              <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-vendor-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-vendor-primary">12</div>
                  <p className="text-xs text-muted-foreground">Ready to order</p>
                </CardContent>
              </Card>

              <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
                  <TrendingUp className="h-4 w-4 text-vendor-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-vendor-primary">₹15,240</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Suppliers & Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-vendor-primary/20">
                <CardHeader>
                  <CardTitle className="text-vendor-primary flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top Rated Suppliers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading suppliers...</p>
                    </div>
                  ) : topSuppliers.length > 0 ? (
                    topSuppliers.map((supplier, index) => (
                      <div key={supplier.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-vendor-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-vendor-primary">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{supplier.name}</h4>
                            <div className="flex items-center gap-1">
                              {renderStars(supplier.averageRating)}
                              <span className="text-xs text-muted-foreground ml-1">
                                {supplier.averageRating.toFixed(1)} ({supplier.totalReviews} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/vendor/browse')}
                          className="text-xs"
                        >
                          View Products
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No rated suppliers found</p>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      variant="vendor-outline" 
                      className="w-full"
                      onClick={() => navigate('/vendor/compare')}
                    >
                      Compare All Suppliers
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-vendor-primary">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Order #1234 delivered</span>
                    <span className="text-success">✓ Completed</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Added 5 items to cart</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Order #1233 packed</span>
                    <span className="text-warning">📦 In Transit</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Reviewed Kumar Vegetables</span>
                    <span className="text-muted-foreground">1 day ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default VendorDashboard;