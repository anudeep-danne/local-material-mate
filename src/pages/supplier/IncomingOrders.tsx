import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  
  // Filter out cancelled orders from incoming orders
  const activeOrders = orders.filter(order => order.status !== 'Cancelled');
  
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
      case "Delivered":
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
        <Badge variant="secondary" className="ml-auto">
          {activeOrders.filter(order => order.status === "Pending").length} pending
        </Badge>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Orders List */}
        {activeOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No incoming orders</h2>
            <p className="text-muted-foreground mb-6">
              Orders placed by vendors will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrders.map((order) => (
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