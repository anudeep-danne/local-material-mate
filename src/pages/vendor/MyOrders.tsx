import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

// Sample orders data
const orders = [
  {
    id: "ORD001",
    date: "2024-01-15",
    supplier: "Kumar Vegetables",
    items: [
      { name: "Fresh Onions", quantity: 5, unit: "kg" },
      { name: "Fresh Potatoes", quantity: 3, unit: "kg" }
    ],
    total: 315,
    status: "delivered",
    estimatedDelivery: "2024-01-17"
  },
  {
    id: "ORD002",
    date: "2024-01-18",
    supplier: "Sharma Traders",
    items: [
      { name: "Fresh Tomatoes", quantity: 4, unit: "kg" },
      { name: "Green Chilies", quantity: 1, unit: "kg" }
    ],
    total: 185,
    status: "packed",
    estimatedDelivery: "2024-01-20"
  },
  {
    id: "ORD003",
    date: "2024-01-20",
    supplier: "Patel Oil Mills",
    items: [
      { name: "Cooking Oil", quantity: 2, unit: "L" }
    ],
    total: 240,
    status: "pending",
    estimatedDelivery: "2024-01-22"
  }
];

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
      return <Truck className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const MyOrders = () => {
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
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Order Details */}
                      <div className="md:col-span-2">
                        <h4 className="font-semibold mb-3">Supplier: {order.supplier}</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span>{item.quantity} {item.unit}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between font-semibold">
                            <span>Total Amount</span>
                            <span className="text-vendor-primary">₹{order.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Delivery Status</h4>
                          <div className="space-y-2">
                            <div className={`flex items-center gap-2 text-sm ${order.status === "pending" ? "text-muted-foreground" : "text-success"}`}>
                              <div className={`w-2 h-2 rounded-full ${order.status === "pending" ? "bg-muted-foreground" : "bg-success"}`} />
                              Order Confirmed
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${order.status === "pending" ? "text-muted-foreground" : "text-success"}`}>
                              <div className={`w-2 h-2 rounded-full ${order.status === "pending" ? "bg-muted" : "bg-success"}`} />
                              Packed
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${order.status !== "delivered" ? "text-muted-foreground" : "text-success"}`}>
                              <div className={`w-2 h-2 rounded-full ${order.status !== "delivered" ? "bg-muted" : "bg-success"}`} />
                              Delivered
                            </div>
                          </div>
                        </div>
                        
                        {order.status !== "delivered" && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Expected delivery:</span>
                            <div className="font-semibold">
                              {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Button variant="vendor-outline" size="sm" className="w-full">
                            Track Order
                          </Button>
                          {order.status === "delivered" && (
                            <Button variant="vendor" size="sm" className="w-full">
                              Reorder
                            </Button>
                          )}
                        </div>
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
                <p className="text-muted-foreground mb-6">
                  Start browsing products to place your first order.
                </p>
                <Button variant="vendor">Browse Products</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MyOrders;