import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Star, TrendingUp, Award, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const VendorDashboard = () => {
  const navigate = useNavigate();
  // Get authenticated user ID
  const { user } = useAuth();
  const vendorId = user?.id || "22222222-2222-2222-2222-222222222222"; // Fallback to real vendor account
  const { stats, loading, error, refetch } = useDashboard(vendorId, 'vendor');

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-success';
      case 'Packed':
        return 'text-warning';
      case 'Pending':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Vendor Dashboard</h1>
            </header>
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-2 border-vendor-primary border-t-transparent rounded-full"></div>
                <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
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
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Vendor Dashboard</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-lg text-destructive mb-4">Error loading dashboard</div>
                <div className="text-sm text-muted-foreground mb-4">{error}</div>
                <Button onClick={refetch}>Retry</Button>
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
            <h1 className="text-2xl font-semibold text-foreground">Vendor Dashboard</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch} 
              className="ml-auto"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                  <div className="text-2xl font-bold text-vendor-primary">{stats.activeOrders}</div>
                  <p className="text-xs text-muted-foreground">Orders in progress</p>
                </CardContent>
              </Card>

              <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-vendor-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-vendor-primary">{stats.cartItems}</div>
                  <p className="text-xs text-muted-foreground">Ready to order</p>
                </CardContent>
              </Card>

              <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
                  <TrendingUp className="h-4 w-4 text-vendor-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-vendor-primary">{formatCurrency(stats.monthlySpend)}</div>
                  <p className="text-xs text-muted-foreground">This month's total</p>
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
                  {stats.topSuppliers && stats.topSuppliers.length > 0 ? (
                    stats.topSuppliers.map((supplier, index) => (
                      <div key={supplier.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-vendor-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-vendor-primary">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{supplier.business_name || supplier.name}</h4>
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
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between text-sm">
                        <span>{activity.message}</span>
                        <span className={getStatusColor(activity.status || '')}>
                          {activity.status || formatTimeAgo(activity.timestamp)}
                        </span>
                  </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                  )}
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