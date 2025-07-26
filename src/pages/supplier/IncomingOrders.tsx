import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, User, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import React from "react";

const IncomingOrders = () => {
  // Using supplier ID for demo - in real app this would come from auth
  const supplierId = "22222222-2222-2222-2222-222222222222";
  const { orders, loading, updateOrderStatus } = useOrders(supplierId, 'supplier');
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});
  
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
  };

  const handleDeclineOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "Cancelled");
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
    switch (currentStatus) {
      case "Pending":
        return (
          <div className="space-y-2">
            <Button 
              variant="supplier" 
              size="sm" 
              className="w-full"
              onClick={() => handleAcceptOrder(orderId)}
            >
              Accept Order
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-destructive hover:text-destructive"
              onClick={() => handleDeclineOrder(orderId)}
            >
              Decline Order
            </Button>
          </div>
        );
      case "Confirmed":
        return (
          <Button 
            variant="supplier" 
            size="sm" 
            className="w-full"
            onClick={() => updateOrderStatus(orderId, "Packed")}
          >
            Mark as Packed
          </Button>
        );
      case "Packed":
        return (
          <Button 
            variant="supplier" 
            size="sm" 
            className="w-full"
            onClick={() => updateOrderStatus(orderId, "Shipped")}
          >
            Mark as Shipped
          </Button>
        );
      case "Shipped":
        return (
          <Button 
            variant="supplier" 
            size="sm" 
            className="w-full"
            onClick={() => updateOrderStatus(orderId, "Out for Delivery")}
          >
            Mark as Out for Delivery
          </Button>
        );
      case "Out for Delivery":
        return (
          <Button 
            variant="supplier" 
            size="sm" 
            className="w-full"
            onClick={() => updateOrderStatus(orderId, "Delivered")}
          >
            Mark as Delivered
          </Button>
        );
      case "Delivered":
        return (
          <div className="text-center text-sm text-muted-foreground">
            Order Completed
          </div>
        );
      case "Cancelled":
        return (
          <div className="text-center text-sm text-destructive">
            Order Cancelled
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SupplierSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">Incoming Orders</h1>
            <Badge variant="secondary" className="ml-auto">
              {orders.filter(order => orderStatuses[order.id] === "Pending").length} pending
            </Badge>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No incoming orders</h2>
                  <p className="text-muted-foreground mb-6">
                    Orders placed by vendors will appear here.
                  </p>
                </div>
              ) : (
                orders.map((order) => (
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
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Vendor Details */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Vendor Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Name:</span>
                              <div>{order.vendor?.name || order.vendor_id}</div>
                            </div>
                            <div>
                              <span className="font-medium">Contact:</span>
                              <div>{order.vendor?.email || 'N/A'}</div>
                            </div>
                          </div>
                        </div>

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
                                onValueChange={(value) => updateOrderStatus(order.id, value as any)}
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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default IncomingOrders;