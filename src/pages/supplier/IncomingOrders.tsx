import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, User } from "lucide-react";
import { useState } from "react";

// Sample orders data
const orders = [
  {
    id: "ORD001",
    vendorName: "Raj's Street Food",
    vendorContact: "+91 98765 43210",
    date: "2024-01-20",
    items: [
      { name: "Fresh Onions", quantity: 5, unit: "kg", price: 45 },
      { name: "Fresh Potatoes", quantity: 3, unit: "kg", price: 30 }
    ],
    total: 315,
    status: "pending"
  },
  {
    id: "ORD002",
    vendorName: "Mumbai Chaat Corner",
    vendorContact: "+91 98765 43211",
    date: "2024-01-19",
    items: [
      { name: "Fresh Tomatoes", quantity: 4, unit: "kg", price: 35 },
      { name: "Green Chilies", quantity: 1, unit: "kg", price: 45 }
    ],
    total: 185,
    status: "packed"
  },
  {
    id: "ORD003",
    vendorName: "Delhi Dosa Hub",
    vendorContact: "+91 98765 43212",
    date: "2024-01-18",
    items: [
      { name: "Basmati Rice", quantity: 10, unit: "kg", price: 80 }
    ],
    total: 800,
    status: "delivered"
  }
];

const IncomingOrders = () => {
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>(
    orders.reduce((acc, order) => ({ ...acc, [order.id]: order.status }), {})
  );

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrderStatuses(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success text-white";
      case "packed":
        return "bg-warning text-white";
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "packed":
        return <Package className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
              {orders.filter(order => orderStatuses[order.id] === "pending").length} pending
            </Badge>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(orderStatuses[order.id])}>
                        {getStatusIcon(orderStatuses[order.id])}
                        <span className="ml-1 capitalize">{orderStatuses[order.id]}</span>
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
                            <div>{order.vendorName}</div>
                          </div>
                          <div>
                            <span className="font-medium">Contact:</span>
                            <div>{order.vendorContact}</div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span>{item.quantity} {item.unit}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t">
                          <div className="flex justify-between font-semibold">
                            <span>Total Amount</span>
                            <span className="text-supplier-primary">₹{order.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Management */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Update Status</h4>
                          <Select 
                            value={orderStatuses[order.id]} 
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="packed">Packed</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Button 
                            variant="supplier" 
                            size="sm" 
                            className="w-full"
                            disabled={orderStatuses[order.id] === "delivered"}
                          >
                            {orderStatuses[order.id] === "pending" && "Accept Order"}
                            {orderStatuses[order.id] === "packed" && "Mark as Delivered"}
                            {orderStatuses[order.id] === "delivered" && "Completed"}
                          </Button>
                          
                          {orderStatuses[order.id] === "pending" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-destructive hover:text-destructive"
                            >
                              Decline Order
                            </Button>
                          )}
                        </div>

                        {orderStatuses[order.id] !== "pending" && (
                          <div className="text-xs text-muted-foreground">
                            <p>• Vendor will be notified of status changes</p>
                            <p>• Contact vendor for delivery coordination</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground">
                  Orders from vendors will appear here once they start purchasing your products.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default IncomingOrders;