import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

const IncomingOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const supplierId = user?.id;
  const { orders, loading, updateOrderStatus } = useOrders(supplierId || "", 'supplier');
  
  // Debug: Log vendor data for each order
  useEffect(() => {
    if (orders.length > 0) {
      console.log('🔍 IncomingOrders: Orders with vendor data:', orders.map(order => ({
        orderId: order.id,
        vendor: order.vendor,
        vendorId: order.vendor_id
      })));
    }
  }, [orders]);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});
  const [orderToDecline, setOrderToDecline] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  
  // Filter out cancelled orders from incoming orders
  const activeOrders = orders.filter(order => order.status !== 'Cancelled');
  
  // Sync orderStatuses with real orders
  React.useEffect(() => {
    if (orders) {
      setOrderStatuses(orders.reduce((acc, order) => ({ ...acc, [order.id]: order.status }), {}));
    }
  }, [orders]);



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

  const handleAcceptOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "Confirmed");
    // Update local state immediately
    setOrderStatuses(prev => ({ ...prev, [orderId]: "Confirmed" }));
  };

  const handleDeclineOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "Cancelled");
    setOrderToDecline(null); // Close the dialog
    // Update local state immediately
    setOrderStatuses(prev => ({ ...prev, [orderId]: "Cancelled" }));
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "Pending":
        return [];
      case "Confirmed":
        return ["Packed"];
      case "Packed":
        return ["Shipped"];
      case "Shipped":
        return ["Out for Delivery"];
      case "Out for Delivery":
        return ["Delivered"];
      default:
        return [];
    }
  };

  const getNextStatusButton = (orderId: string, currentStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    
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
              variant="supplier" 
              size="sm" 
              className="w-full"
              onClick={() => handleAcceptOrder(orderId)}
            >
              Accept Order
            </Button>
            <AlertDialog open={orderToDecline === orderId} onOpenChange={(open) => !open && setOrderToDecline(null)}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => setOrderToDecline(orderId)}
                >
                  Decline Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Decline Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to decline this order? This action cannot be undone and the order will be cancelled.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeclineOrder(orderId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Decline Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      case "Confirmed":
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
              variant="supplier" 
              size="sm" 
              className="w-full"
              onClick={async () => {
                await updateOrderStatus(orderId, "Packed");
                setOrderStatuses(prev => ({ ...prev, [orderId]: "Packed" }));
              }}
            >
              Mark as Packed
            </Button>
          </div>
        );
      case "Packed":
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
              variant="supplier" 
              size="sm" 
              className="w-full"
              onClick={async () => {
                await updateOrderStatus(orderId, "Shipped");
                setOrderStatuses(prev => ({ ...prev, [orderId]: "Shipped" }));
              }}
            >
              Mark as Shipped
            </Button>
          </div>
        );
      case "Shipped":
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
              variant="supplier" 
              size="sm" 
              className="w-full"
              onClick={async () => {
                await updateOrderStatus(orderId, "Out for Delivery");
                setOrderStatuses(prev => ({ ...prev, [orderId]: "Out for Delivery" }));
              }}
            >
              Mark as Out for Delivery
            </Button>
          </div>
        );
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
              variant="supplier" 
              size="sm" 
              className="w-full"
              onClick={async () => {
                await updateOrderStatus(orderId, "Delivered");
                setOrderStatuses(prev => ({ ...prev, [orderId]: "Delivered" }));
              }}
            >
              Mark as Delivered
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
      case "Cancelled":
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
            <div className="text-center text-sm text-destructive">
              Order Cancelled
            </div>
          </div>
        );
      default:
        return null;
    }
  };



  return (
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-2xl font-semibold text-foreground">Incoming Orders</h1>
        <Badge variant="secondary" className="ml-auto">
          {activeOrders.filter(order => orderStatuses[order.id] === "Pending").length} pending
        </Badge>
      </header>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">Loading orders...</div>
              ) : activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No incoming orders</h2>
                  <p className="text-muted-foreground mb-6">
                    Orders placed by vendors will appear here.
                  </p>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <Badge className={getStatusColor(orderStatuses[order.id])}>
                          {getStatusIcon(orderStatuses[order.id])}
                          <span className="ml-1">{orderStatuses[order.id]}</span>
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
                              <span>{order.product?.name || order.product_id}</span>
                              <span>{order.quantity} units</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t">
                            <div className="flex justify-between font-semibold">
                              <span>Total Amount</span>
                              <span className="text-supplier-primary">₹{order.total_amount}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Management */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-3">Order Status</h4>
                            {orderStatuses[order.id] !== "Pending" && orderStatuses[order.id] !== "Cancelled" && (
                              <Select 
                                value={orderStatuses[order.id]} 
                                onValueChange={async (value) => {
                                  await updateOrderStatus(order.id, value as any);
                                  setOrderStatuses(prev => ({ ...prev, [order.id]: value }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                                  <SelectItem value="Packed">Packed</SelectItem>
                                  <SelectItem value="Shipped">Shipped</SelectItem>
                                  <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>

                          <div className="space-y-2">
                            {getNextStatusButton(order.id, orderStatuses[order.id])}
                          </div>

                          {orderStatuses[order.id] !== "Pending" && orderStatuses[order.id] !== "Cancelled" && (
                            <div className="text-xs text-muted-foreground">
                              Status can be updated using the dropdown above
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
                    <div className="text-supplier-primary font-semibold">₹{selectedOrderDetails.total_amount}</div>
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
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Phone:</span>
                      <div className="text-muted-foreground">{selectedOrderDetails.vendor?.phone || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Location:</span>
                      <div className="text-muted-foreground">
                        {selectedOrderDetails.vendor?.city || 'N/A'}{selectedOrderDetails.vendor?.state ? `, ${selectedOrderDetails.vendor.state}` : ''}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>
                    <div className="text-muted-foreground">{selectedOrderDetails.vendor?.address || 'N/A'}</div>
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
                      {selectedOrderDetails.cancelled_by === 'vendor' ? 'Vendor' : 'You'}
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
        </>
      );
};

export default IncomingOrders;