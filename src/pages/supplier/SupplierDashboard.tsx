import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Inbox, Star, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SupplierDashboard = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SupplierSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">Supplier Dashboard</h1>
          </header>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Welcome back, Supplier!</h2>
              <p className="text-muted-foreground">Manage your products and track your business performance.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-supplier-primary/20 hover:border-supplier-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-supplier-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-supplier-primary">24</div>
                  <p className="text-xs text-muted-foreground">+3 this month</p>
                </CardContent>
              </Card>

              <Card className="border-supplier-primary/20 hover:border-supplier-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Inbox className="h-4 w-4 text-supplier-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-supplier-primary">7</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card className="border-supplier-primary/20 hover:border-supplier-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-supplier-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-supplier-primary">4.6</div>
                  <p className="text-xs text-muted-foreground">From 45 reviews</p>
                </CardContent>
              </Card>

              <Card className="border-supplier-primary/20 hover:border-supplier-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-supplier-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-supplier-primary">₹32,580</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-supplier-primary">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="supplier" 
                    className="w-full justify-start"
                    onClick={() => navigate('/supplier/add-product')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                  <Button 
                    variant="supplier-outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/supplier/orders')}
                  >
                    <Inbox className="mr-2 h-4 w-4" />
                    Check Orders (7 pending)
                  </Button>
                  <Button 
                    variant="supplier-outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/supplier/products')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Manage Products
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-supplier-primary">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>New order received</span>
                    <span className="text-success">Just now</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Product "Fresh Onions" updated</span>
                    <span className="text-muted-foreground">1 hour ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>5-star review received</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Order #ORD001 delivered</span>
                    <span className="text-muted-foreground">1 day ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-supplier-primary">Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Fresh Tomatoes</h4>
                      <p className="text-sm text-muted-foreground">15 orders this month</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹2,100</p>
                      <p className="text-sm text-success">+25%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Fresh Onions</h4>
                      <p className="text-sm text-muted-foreground">12 orders this month</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹1,800</p>
                      <p className="text-sm text-success">+12%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Green Chilies</h4>
                      <p className="text-sm text-muted-foreground">8 orders this month</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹960</p>
                      <p className="text-sm text-success">+8%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SupplierDashboard;