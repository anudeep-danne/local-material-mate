import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Inbox, Star, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const supplierId = user?.id;
  const { stats, loading, error, refetch } = useDashboard(supplierId || "", 'supplier');

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
        {/* Header */}
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Supplier Dashboard</h1>
        </header>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-supplier-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Header */}
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Supplier Dashboard</h1>
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
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Supplier Dashboard</h1>
      </header>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, Supplier!</h2>
          <p className="text-sm md:text-base text-muted-foreground">Manage your products and track your business performance.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="border-supplier-primary/20 hover:border-supplier-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Products</CardTitle>
              <Package className="h-3 w-3 md:h-4 md:w-4 text-supplier-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-supplier-primary">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active products</p>
            </CardContent>
          </Card>

          <Card className="border-supplier-primary/20 hover:border-supplier-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Pending Orders</CardTitle>
              <Inbox className="h-3 w-3 md:h-4 md:w-4 text-supplier-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-supplier-primary">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card className="border-supplier-primary/20 hover:border-supplier-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-3 w-3 md:h-4 md:w-4 text-supplier-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-supplier-primary">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">From {stats.totalReviews} reviews</p>
            </CardContent>
          </Card>

          <Card className="border-supplier-primary/20 hover:border-supplier-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-supplier-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-supplier-primary">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">This month's total</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-1 gap-6">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-lg md:text-xl text-supplier-primary">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between text-xs md:text-sm">
                    <span className="truncate flex-1 mr-2">{activity.message}</span>
                    <span className={`text-xs flex-shrink-0 ${getStatusColor(activity.status || '')}`}>
                      {activity.status || formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl text-supplier-primary">Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {stats.topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base truncate">{product.name}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{product.orders} orders this month</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-sm md:text-base">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs md:text-sm text-success">+{product.growth}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No product data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupplierDashboard;