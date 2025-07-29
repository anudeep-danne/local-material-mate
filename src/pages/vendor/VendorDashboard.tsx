import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Star, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { useCartContext } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/useOrders";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // Get authenticated user ID
  const { user, loading: authLoading } = useAuth();
  const vendorId = user?.id;
  
  // Only call hooks when we have a valid vendorId
  const { stats, loading: dashboardLoading, error, refetch } = useDashboard(
    vendorId || null, 
    'vendor'
  );
  const { cartItemsCount } = useCartContext();
  const { orders, loading: ordersLoading } = useOrders(
    vendorId || null, 
    'vendor'
  );
  
  // Combined loading state
  const loading = authLoading || dashboardLoading || ordersLoading;

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
      <>
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Vendor Dashboard</h1>
        </header>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-vendor-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">
              {authLoading ? 'Checking authentication...' : 'Loading dashboard...'}
            </span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Vendor Dashboard</h1>
        </header>
        <div className="p-4 md:p-6">
          <div className="text-center py-8">
            <div className="text-lg text-destructive mb-4">Error loading dashboard</div>
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
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Vendor Dashboard</h1>
      </header>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, Vendor!</h2>
          <p className="text-sm md:text-base text-muted-foreground">Track your orders and manage your business.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Active Orders</CardTitle>
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 text-vendor-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-vendor-primary">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Cart Items</CardTitle>
              <Package className="h-3 w-3 md:h-4 md:w-4 text-vendor-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-vendor-primary">{cartItemsCount}</div>
              <p className="text-xs text-muted-foreground">In cart</p>
            </CardContent>
          </Card>

          <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-3 w-3 md:h-4 md:w-4 text-vendor-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-vendor-primary">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">From {stats.totalReviews} reviews</p>
            </CardContent>
          </Card>

          <Card className="border-vendor-primary/20 hover:border-vendor-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Monthly Spend</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-vendor-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-vendor-primary">{formatCurrency(stats.monthlySpend)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl text-vendor-primary">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base truncate">{order.product?.name || 'Product'}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Order #{order.id?.slice(0, 8) || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-sm md:text-base">{formatCurrency(order.total_amount)}</p>
                      <p className={`text-xs md:text-sm ${getStatusColor(order.status)}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Suppliers */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl text-vendor-primary">Top Rated Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSuppliers && stats.topSuppliers.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {stats.topSuppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base truncate">{supplier.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(supplier.averageRating)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({supplier.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-sm md:text-base">{formatCurrency(supplier.averageRating * 1000)}</p>
                      <p className="text-xs md:text-sm text-success">+5%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No supplier data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VendorDashboard;