import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VendorDashboard = () => {
  const navigate = useNavigate();

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-vendor-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-vendor-primary">4.8</div>
                  <p className="text-xs text-muted-foreground">From suppliers</p>
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

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-vendor-primary">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="vendor" 
                    className="w-full justify-start"
                    onClick={() => navigate('/vendor/browse')}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Browse Products
                  </Button>
                  <Button 
                    variant="vendor-outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/vendor/cart')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    View Cart (12 items)
                  </Button>
                  <Button 
                    variant="vendor-outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/vendor/orders')}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Track Orders
                  </Button>
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