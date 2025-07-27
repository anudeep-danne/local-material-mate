import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
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
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, MapPin, Phone, Mail, Building, AlertCircle } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useCartContext } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

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
    case "Confirmed":
      return "bg-green-500 text-white";
    case "Cancelled":
      return "bg-destructive text-white";
    case "Pending":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

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
    case "Confirmed":
      return <CheckCircle className="h-4 w-4" />;
    case "Cancelled":
      return <XCircle className="h-4 w-4" />;
    case "Pending":
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const MyOrders = () => {
  // Get authenticated user ID
  const { user, loading: authLoading } = useAuth();
  const vendorId = user?.id;
  
  // Only call useOrders when we have a valid vendorId
  const { orders, loading: ordersLoading, cancelOrder, refetch, error: ordersError } = useOrders(
    vendorId || null, 
    'vendor'
  );
  
  // Combined loading state
  const loading = authLoading || ordersLoading;
  const { addToCart } = useCartContext();
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<any>(null);
  
  // Force refresh when component mounts or vendorId changes
  useEffect(() => {
    if (vendorId && vendorId.trim() !== '') {
      console.log('🔄 MyOrders: Vendor authenticated:', vendorId);
    }
  }, [vendorId]);
  
  // Additional refresh when orders change
  useEffect(() => {
    console.log('🔄 MyOrders: Orders changed, current count:', orders.length);
  }, [orders]);
  
  // Filter orders based on selected status
  const getFilteredOrders = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    switch (statusFilter) {
      case 'active':
        return orders.filter(order => 
          order.status !== 'Cancelled' && order.status !== 'Delivered'
        );
      case 'delivered':
        return orders.filter(order => order.status === 'Delivered');
      case 'cancelled':
        return orders.filter(order => 
          order.status === 'Cancelled' && 
          new Date(order.updated_at) > thirtyDaysAgo
        );
      default:
        return orders.filter(order => 
          order.status !== 'Cancelled' && order.status !== 'Delivered'
        );
    }
  };
  
  const filteredOrders = getFilteredOrders();
  
  // Debug logging
  console.log('🔄 MyOrders: Current state:', {
    vendorId,
    totalOrders: orders.length,
    filteredOrders: filteredOrders.length,
    statusFilter,
    loading
  });
  
  // Helper functions for empty state messages
  const getActiveOrders = () => orders.filter(order => 
    order.status !== 'Cancelled' && order.status !== 'Delivered'
  );
  
  const getDeliveredOrders = () => orders.filter(order => 
    order.status === 'Delivered'
  );
  
  const getCancelledOrders = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orders.filter(order => 
      order.status === 'Cancelled' && 
      new Date(order.updated_at) > thirtyDaysAgo
    );
  };

  const handleReorder = async (order: any) => {
    await addToCart(order.product_id, order.quantity);
  };

  const handleCancelOrder = async (orderId: string) => {
    await cancelOrder(orderId);
    setOrderToCancel(null);
  };

  const getTrackingSteps = (orderStatus: string) => {
    const steps = [
      { status: 'Pending', name: 'Order Placed' },
      { status: 'Confirmed', name: 'Order Confirmed' },
      { status: 'Packed', name: 'Order Packed' },
      { status: 'Shipped', name: 'Order Shipped' },
      { status: 'Out for Delivery', name: 'Out for Delivery' },
      { status: 'Delivered', name: 'Delivered' }
    ];

    return steps.map(step => {
      const stepIndex = steps.findIndex(s => s.status === step.status);
      const currentIndex = steps.findIndex(s => s.status === orderStatus);
      
      const isCompleted = stepIndex < currentIndex;
      const isCurrent = step.status === orderStatus;
      
      return {
        ...step,
        isCompleted,
        isCurrent
      };
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <VendorSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">My Orders</h1>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🔄 MyOrders: Manual refresh triggered');
                  refetch();
                }}
                disabled={loading}
              >
                Refresh
              </Button>
              <Badge variant="secondary">
                {filteredOrders.length} orders
              </Badge>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">

            
            {/* Filter Dropdown - Always visible */}
            <div className="mb-6">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Orders</SelectItem>
                  <SelectItem value="delivered">Delivered Orders</SelectItem>
                  <SelectItem value="cancelled">Cancelled Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {/* Error Display */}
              {ordersError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <h3 className="font-semibold text-destructive">Error Loading Orders</h3>
                  </div>
                  <p className="text-sm text-destructive/80 mt-1">{ordersError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refetch}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {!vendorId && !authLoading ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Please log in</h2>
                  <p className="text-muted-foreground mb-6">
                    You need to be logged in to view your orders.
                  </p>
                  <Button variant="vendor" onClick={() => window.location.href = '/vendor/login'}>
                    Go to Login
                  </Button>
                </div>
              ) : loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {authLoading ? 'Checking authentication...' : 'Loading orders...'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {authLoading ? 'Verifying your login status...' : 'Fetching your order data...'}
                  </p>
                  {!authLoading && vendorId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Loading orders for vendor: {vendorId.substring(0, 8)}...
                    </p>
                  )}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  {statusFilter === 'active' && getActiveOrders().length === 0 ? (
                    <>
                      <h2 className="text-xl font-semibold mb-2">No active orders</h2>
                      <p className="text-muted-foreground mb-6">
                        You don't have any active orders at the moment.
                      </p>
                      <Button variant="vendor">Browse Products</Button>
                    </>
                  ) : statusFilter === 'delivered' && getDeliveredOrders().length === 0 ? (
                    <>
                      <h2 className="text-xl font-semibold mb-2">No delivered products yet</h2>
                      <p className="text-muted-foreground mb-6">
                        You haven't received any delivered orders yet.
                      </p>
                    </>
                  ) : statusFilter === 'cancelled' && getCancelledOrders().length === 0 ? (
                    <>
                      <h2 className="text-xl font-semibold mb-2">No cancelled orders</h2>
                      <p className="text-muted-foreground mb-6">
                        You don't have any cancelled orders from the last 30 days.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                      <p className="text-muted-foreground mb-6">
                        Start browsing products to place your first order.
                      </p>
                      <Button variant="vendor">Browse Products</Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => {
                      const isCancelled = order.status === 'Cancelled';
                      
                      return (
                        <Card key={order.id} className={`overflow-hidden ${isCancelled ? 'opacity-75' : ''}`}>
                          <CardHeader className="bg-muted/30">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
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
                              {/* Order Details */}
                              <div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Product:</span>
                                    <span>{order.product?.name || order.product_id}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Quantity:</span>
                                    <span>{order.quantity} units</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Supplier:</span>
                                    <span>{order.supplier?.business_name || order.supplier?.name || 'Unknown Supplier'}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Order Date:</span>
                                    <span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <div className="flex justify-between font-semibold">
                                    <span>Total Amount</span>
                                    <span className="text-vendor-primary">₹{order.total_amount}</span>
                                  </div>
                                </div>
                                
                                {/* Cancellation Info */}
                                {isCancelled && (
                                  <div className="mt-4 pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                      <span className="font-medium">Cancellation:</span> 
                                      {order.cancelled_by === 'vendor' ? ' Cancelled by you' : ' Cancelled by supplier'}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="space-y-2">
                                {/* View Details Button */}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => setSelectedOrderDetails(order)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                
                                {/* Track Order Button */}
                                {!isCancelled && order.status !== "Delivered" && (
                                  <Button 
                                    variant="vendor-outline" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => setSelectedOrderTracking(order)}
                                  >
                                    <Truck className="h-4 w-4 mr-2" />
                                    Track Order
                                  </Button>
                                )}
                                
                                {/* Reorder Button */}
                                {(order.status === "Delivered" || isCancelled) && (
                                  <Button 
                                    variant="vendor" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => handleReorder(order)}
                                  >
                                    Reorder
                                  </Button>
                                )}
                                
                                {/* Cancel Order Button */}
                                {order.status === "Pending" && (
                                  <AlertDialog open={orderToCancel === order.id} onOpenChange={(open) => !open && setOrderToCancel(null)}>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="w-full mt-2"
                                        onClick={() => setOrderToCancel(order.id)}
                                      >
                                        Cancel Order
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to cancel this order? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleCancelOrder(order.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Cancel Order
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                
                                {isCancelled && (
                                  <div className="text-center text-sm text-muted-foreground">
                                    Order was cancelled
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        </main>
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Order ID:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.id}</div>
                  </div>
                  <div>
                    <span className="font-medium">Order Date:</span>
                    <div className="text-muted-foreground">
                      {new Date(selectedOrderDetails.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(selectedOrderDetails.status)}>
                        {getStatusIcon(selectedOrderDetails.status)}
                        <span className="ml-1">{selectedOrderDetails.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span>
                    <div className="text-vendor-primary font-semibold">₹{selectedOrderDetails.total_amount}</div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Product Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Product Name:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.product?.name || selectedOrderDetails.product_id}</div>
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.quantity} units</div>
                  </div>
                  <div>
                    <span className="font-medium">Unit Price:</span>
                    <div className="text-muted-foreground">₹{selectedOrderDetails.product?.price || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Supplier Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Business Name:</span>
                      <div className="text-muted-foreground">{selectedOrderDetails.supplier?.business_name || selectedOrderDetails.supplier?.name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Email:</span>
                      <div className="text-muted-foreground">{selectedOrderDetails.supplier?.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Phone:</span>
                      <div className="text-muted-foreground">{selectedOrderDetails.supplier?.phone || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Location:</span>
                      <div className="text-muted-foreground">
                        {selectedOrderDetails.supplier?.city || 'N/A'}{selectedOrderDetails.supplier?.state ? `, ${selectedOrderDetails.supplier.state}` : ''}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.supplier?.address || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Cancellation Info */}
              {selectedOrderDetails.status === 'Cancelled' && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-destructive">Cancellation Information</h3>
                  <div className="text-sm">
                    <span className="font-medium">Cancelled by:</span>
                    <div className="text-muted-foreground">
                      {selectedOrderDetails.cancelled_by === 'vendor' ? 'You' : 'Supplier'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Tracking Dialog */}
      <AlertDialog open={!!selectedOrderTracking} onOpenChange={(open) => !open && setSelectedOrderTracking(null)}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Order Tracking</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedOrderTracking && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Order #{selectedOrderTracking.id}</h3>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(selectedOrderTracking.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Tracking Steps */}
              <div className="space-y-4">
                <h3 className="font-semibold">Delivery Status</h3>
                <div className="space-y-3">
                  {getTrackingSteps(selectedOrderTracking.status).map((step, index) => (
                    <div 
                      key={step.status}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        step.isCompleted 
                          ? "bg-success/10 border-success/20" 
                          : step.isCurrent 
                          ? "bg-blue-50 border-blue-200" 
                          : "bg-muted/50 border-muted"
                      }`}
                    >
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          step.isCompleted 
                            ? "bg-success" 
                            : step.isCurrent 
                            ? "bg-blue-600" 
                            : "bg-muted"
                        }`} 
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${
                          step.isCompleted 
                            ? "text-success" 
                            : step.isCurrent 
                            ? "text-blue-600" 
                            : "text-muted-foreground"
                        }`}>
                          {step.name}
                        </div>
                        {step.isCurrent && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Currently in progress
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated Delivery */}
              {selectedOrderTracking.status !== 'Delivered' && selectedOrderTracking.status !== 'Cancelled' && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Estimated Delivery</h4>
                  <p className="text-sm text-blue-700">
                    Your order is expected to be delivered within 2-3 business days.
                  </p>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default MyOrders;