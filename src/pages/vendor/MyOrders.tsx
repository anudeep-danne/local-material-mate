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
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

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
  // Using vendor ID for demo - in real app this would come from auth
  const vendorId = "11111111-1111-1111-1111-111111111111";
  const { orders, loading, cancelOrder } = useOrders(vendorId, 'vendor');
  const { addToCart } = useCart(vendorId);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  
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
    if (order.product_id) {
      await addToCart(order.product_id, order.quantity);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      setOrderToCancel(null); // Close the dialog
      // The useOrders hook will automatically refetch and update the UI
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const getTrackingSteps = (orderStatus: string) => {
    const steps = [
      { name: "Order Confirmed", status: "Confirmed" },
      { name: "Packed", status: "Packed" },
      { name: "Shipped", status: "Shipped" },
      { name: "Out for Delivery", status: "Out for Delivery" },
      { name: "Delivered", status: "Delivered" }
    ];

    return steps.map((step, index) => {
      const isCompleted = steps.findIndex(s => s.status === orderStatus) >= index;
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
              {loading ? (
                <div className="text-center py-12">Loading orders...</div>
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
                      const trackingSteps = getTrackingSteps(order.status);
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
                            <div className="grid md:grid-cols-3 gap-6">
                              {/* Order Details */}
                              <div className="md:col-span-2">
                                <h4 className="font-semibold mb-3">Supplier: {order.supplier?.name || order.supplier_id}</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>{order.product?.name || order.product_id}</span>
                                    <span>{order.quantity} units</span>
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

                              {/* Delivery Info */}
                              <div className="space-y-4">
                                {!isCancelled && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Delivery Status</h4>
                                    <div className="space-y-2">
                                      {trackingSteps.map((step, index) => (
                                        <div 
                                          key={step.status}
                                          className={`flex items-center gap-2 text-sm ${
                                            step.isCompleted 
                                              ? "text-success" 
                                              : step.isCurrent 
                                              ? "text-blue-600 font-medium" 
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          <div 
                                            className={`w-2 h-2 rounded-full ${
                                              step.isCompleted 
                                                ? "bg-success" 
                                                : step.isCurrent 
                                                ? "bg-blue-600" 
                                                : "bg-muted"
                                            }`} 
                                          />
                                          {step.name}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="space-y-2">
                                  {!isCancelled && order.status !== "Delivered" && (
                                    <Button variant="vendor-outline" size="sm" className="w-full">
                                      Track Order
                                    </Button>
                                  )}
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
    </SidebarProvider>
  );
};

export default MyOrders;