import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";

// Sample cart data
const initialCartItems = [
  {
    id: 1,
    name: "Fresh Onions",
    supplier: "Kumar Vegetables",
    price: 45,
    unit: "kg",
    quantity: 2,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150"
  },
  {
    id: 2,
    name: "Fresh Tomatoes",
    supplier: "Sharma Traders",
    price: 35,
    unit: "kg",
    quantity: 3,
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=150"
  },
  {
    id: 3,
    name: "Cooking Oil",
    supplier: "Patel Oil Mills",
    price: 120,
    unit: "L",
    quantity: 1,
    image: "https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=150"
  }
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <VendorSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">My Cart</h1>
            <Badge variant="secondary" className="ml-auto">
              {cartItems.length} items
            </Badge>
          </header>

          {/* Content */}
          <div className="p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Browse our products and add items to your cart.
                </p>
                <Button variant="vendor">Start Shopping</Button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xl font-semibold">Cart Items</h2>
                  {cartItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.supplier}</p>
                            <p className="text-vendor-primary font-semibold">
                              ₹{item.price}/{item.unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ₹{item.price * item.quantity}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-vendor-primary">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (5%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span className="text-vendor-primary">₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4">
                        <Button variant="vendor" className="w-full" size="lg">
                          Place Order
                        </Button>
                        <Button variant="vendor-outline" className="w-full">
                          Continue Shopping
                        </Button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>• Free delivery on orders above ₹500</p>
                        <p>• Estimated delivery: 2-3 business days</p>
                        <p>• All prices include applicable taxes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Cart;