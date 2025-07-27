import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Package, Clock, CheckCircle, User, Truck, XCircle, Eye, MapPin, Phone, Mail, Building } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const IncomingOrders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError } = useAuth();
  const supplierId = user?.id;
  const { orders, loading, updateOrderStatus } = useOrders(supplierId || null, 'supplier');
  const { toast } = useToast();
  
  const [orderToDecline, setOrderToDecline] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState<string>('active');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  
  // Filter orders based on selected filter and quick filter
  const getFilteredOrders = () => {
    let filtered = [];
    
    switch (orderFilter) {
      case 'active':
        filtered = orders.filter(order => 
          ['Pending', 'Packed', 'Shipped', 'Out for Delivery'].includes(order.status)
        );
        break;
      case 'delivered':
        filtered = orders.filter(order => order.status === 'Delivered');
        break;
      default:
        filtered = orders.filter(order => 
          ['Pending', 'Packed', 'Shipped', 'Out for Delivery'].includes(order.status)
        );
    }
    
    // Apply quick filter if set
    if (quickFilter && orderFilter === 'active') {
      filtered = filtered.filter(order => order.status === quickFilter);
    }
    
    return filtered;
  };
  
  const filteredOrders = getFilteredOrders();
  
  // Status color function
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-success text-white";
      case "Out for Delivery":
        return "bg-blue-500 text-white";
      case "Shipped":
        return "bg-purple-500 text-white";
      case "Packed":
        return "bg-warning text-white";
      case "Cancelled":
        return "bg-destructive text-white";
      case "Pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  // Status icon function
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "Out for Delivery":
        return <Truck className="h-4 w-4" />;
      case "Shipped":
        return <Package className="h-4 w-4" />;
      case "Packed":
        return <Package className="h-4 w-4" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Accept order function
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "Packed");
      toast({
        title: "Success",
        description: "Order accepted and marked as packed",
      });
    } catch (error) {
      console.error('❌ Failed to accept order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      });
    }
  };
  
  // Decline order function
  const handleDeclineOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "Cancelled");
      setOrderToDecline(null);
      toast({
        title: "Success",
        description: "Order declined successfully",
      });
    } catch (error) {
      console.error('❌ Failed to decline order:', error);
      toast({
        title: "Error",
        description: "Failed to decline order",
        variant: "destructive",
      });
    }
  };
  
  // Get next status in sequence
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "Packed": return "Shipped";
      case "Shipped": return "Out for Delivery";
      case "Out for Delivery": return "Delivered";
      default: return null;
    }
  };
  
  // Get button label for next status
  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case "Packed": return "Mark as Shipped";
      case "Shipped": return "Mark as Out for Delivery";
      case "Out for Delivery": return "Mark as Delivered";
      default: return "";
    }
  };
  
  // Update status to next in sequence
  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;
    
    try {
      await updateOrderStatus(orderId, nextStatus);
      toast({
        title: "Success",
        description: `Status updated to ${nextStatus}`,
      });
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };
  
  // Get status buttons based on current status
  const getStatusButtons = (order: any) => {
    const currentStatus = order.status;
    
    // For delivered orders, only show view details
    if (currentStatus === "Delivered") {
      return (
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setSelectedOrderDetails(order)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Order Completed
          </div>
        </div>
      );
    }
    
    switch (currentStatus) {
      case "Pending":
        return (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setSelectedOrderDetails(order)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleAcceptOrder(order.id)}
            >
              Accept Order
            </Button>
            <AlertDialog open={orderToDecline === order.id} onOpenChange={(open) => !open && setOrderToDecline(null)}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => setOrderToDecline(order.id)}
                >
                  Decline Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Decline Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to decline this order?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeclineOrder(order.id)}>
                    Decline Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      case "Packed":
      case "Shipped":
      case "Out for Delivery":
        return (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setSelectedOrderDetails(order)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleUpdateStatus(order.id, currentStatus)}
            >
              {getNextStatusLabel(currentStatus)}
            </Button>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setSelectedOrderDetails(order)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        );
    }
  };
  
  // Show loading state
  if (authLoading || loading) {
    return (
      <>
        {/* Header */}
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-2xl font-semibold text-foreground">Incoming Orders</h1>
        </header>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-supplier-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Loading orders...</span>
          </div>
        </div>
      </>
    );
  }
  
  // Show error state
  if (authError) {
    return (
      <>
        {/* Header */}
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-2xl font-semibold text-foreground">Incoming Orders</h1>
        </header>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-lg text-destructive mb-4">Authentication Error</div>
            <div className="text-sm text-muted-foreground mb-4">{authError}</div>
            <Button onClick={() => navigate('/supplier-login')}>Go to Login</Button>
          </div>
        </div>
      </>
    );
  }
  
  // Show not authenticated state
  if (!user) {
    return (
      <>
        {/* Header */}
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-2xl font-semibold text-foreground">Incoming Orders</h1>
        </header>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-lg text-destructive mb-4">Not Logged In</div>
            <div className="text-sm text-muted-foreground mb-4">Please log in to access this page.</div>
            <Button onClick={() => navigate('/supplier-login')}>Go to Login</Button>
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
        <h1 className="text-2xl font-semibold text-foreground">Incoming Orders</h1>
        <div className="ml-auto flex items-center gap-4">
          <Select value={orderFilter} onValueChange={setOrderFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Orders</SelectItem>
              <SelectItem value="delivered">Delivered Orders</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            {/* Total Orders Badge */}
            <Badge variant="secondary">
              {orderFilter === 'active' 
                ? `${filteredOrders.length} active`
                : `${filteredOrders.length} delivered`
              }
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {orderFilter === 'active' 
              ? quickFilter 
                ? `${quickFilter} Orders` 
                : 'Active Orders'
              : 'Delivered Orders'
            }
          </h2>
          <p className="text-sm text-muted-foreground">
            {orderFilter === 'active' 
              ? quickFilter
                ? `Showing only ${quickFilter.toLowerCase()} orders`
                : 'Orders that are pending, packed, shipped, or out for delivery'
              : 'Orders that have been completed and delivered'
            }
          </p>
          
          {/* Status Summary for Active Orders */}
          {orderFilter === 'active' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className={`bg-orange-50 text-orange-700 border-orange-200 cursor-pointer transition-colors ${
                  quickFilter === 'Pending' ? 'ring-2 ring-orange-300 bg-orange-100' : ''
                }`}
                onClick={() => setQuickFilter(quickFilter === 'Pending' ? null : 'Pending')}
              >
                <Clock className="h-3 w-3 mr-1" />
                {orders.filter(order => order.status === "Pending").length} Pending
              </Badge>
              <Badge 
                variant="outline" 
                className={`bg-yellow-50 text-yellow-700 border-yellow-200 cursor-pointer transition-colors ${
                  quickFilter === 'Packed' ? 'ring-2 ring-yellow-300 bg-yellow-100' : ''
                }`}
                onClick={() => setQuickFilter(quickFilter === 'Packed' ? null : 'Packed')}
              >
                <Package className="h-3 w-3 mr-1" />
                {orders.filter(order => order.status === "Packed").length} Packed
              </Badge>
              <Badge 
                variant="outline" 
                className={`bg-purple-50 text-purple-700 border-purple-200 cursor-pointer transition-colors ${
                  quickFilter === 'Shipped' ? 'ring-2 ring-purple-300 bg-purple-100' : ''
                }`}
                onClick={() => setQuickFilter(quickFilter === 'Shipped' ? null : 'Shipped')}
              >
                <Truck className="h-3 w-3 mr-1" />
                {orders.filter(order => order.status === "Shipped").length} Shipped
              </Badge>
              <Badge 
                variant="outline" 
                className={`bg-blue-50 text-blue-700 border-blue-200 cursor-pointer transition-colors ${
                  quickFilter === 'Out for Delivery' ? 'ring-2 ring-blue-300 bg-blue-100' : ''
                }`}
                onClick={() => setQuickFilter(quickFilter === 'Out for Delivery' ? null : 'Out for Delivery')}
              >
                <Truck className="h-3 w-3 mr-1" />
                {orders.filter(order => order.status === "Out for Delivery").length} Out for Delivery
              </Badge>
              
              {/* Clear Filter Button */}
              {quickFilter && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setQuickFilter(null)}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {orderFilter === 'active' ? 'No active orders' : 'No delivered orders'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {orderFilter === 'active' 
                ? 'Orders with status Pending, Packed, Shipped, or Out for Delivery will appear here.'
                : 'Completed orders will appear here.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{order.product?.name || order.product_id || 'Unknown Product'}</span>
                          <span>{order.quantity} units</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total Amount</span>
                          <span className="text-green-600">₹{order.total_amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Management */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {getStatusButtons(order)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <AlertDialog open={!!selectedOrderDetails} onOpenChange={(open) => !open && setSelectedOrderDetails(null)}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Order Details</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedOrderDetails && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Order ID:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.id}</div>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.status}</div>
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span>
                    <div className="text-green-600 font-semibold">₹{selectedOrderDetails.total_amount}</div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Product Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Product Name:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.product?.name || selectedOrderDetails.product_id || 'Unknown'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.quantity} units</div>
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Vendor Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Business Name:</span>
                      <div className="text-muted-foreground">{selectedOrderDetails.vendor?.business_name || selectedOrderDetails.vendor?.name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Email:</span>
                      <div className="text-muted-foreground">{selectedOrderDetails.vendor?.email || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IncomingOrders;