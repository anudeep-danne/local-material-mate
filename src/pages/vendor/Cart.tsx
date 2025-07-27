import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";

const Cart = () => {
  // Get authenticated user ID
  const { user } = useAuth();
  const vendorId = user?.id || "22222222-2222-2222-2222-222222222222"; // Fallback to real vendor account
  
  const { cartItems, loading, total, updateQuantity, removeFromCart, clearCart } = useCartContext();
  const { placeOrder } = useOrders(vendorId, 'vendor');
  
  // Debug: Log cart items when they change
  console.log('🛒 Cart: Current cart items:', cartItems, 'Total:', total);

  const subtotal = total;
  const tax = subtotal * 0.05; // 5% tax
  const finalTotal = subtotal + tax;

  const handlePlaceOrder = async () => {
    const success = await placeOrder(cartItems);
    if (success) {
      await clearCart();
    }
  };

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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
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
                            src={item.product.image_url || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=150'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.product.category}</p>
                            <p className="text-sm text-vendor-primary font-medium">
                              {item.product.supplier?.business_name || item.product.supplier?.name}
                            </p>
                            <p className="text-vendor-primary font-semibold">
                              ₹{item.product.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={async () => {
                                try {
                                  console.log('🛒 Cart: Decreasing quantity for item:', item.id, 'Current:', item.quantity, 'New:', item.quantity - 1);
                                  await updateQuantity(item.id, item.quantity - 1);
                                } catch (error) {
                                  console.error('🛒 Cart: Error decreasing quantity:', error);
                                }
                              }}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={async () => {
                                try {
                                  console.log('🛒 Cart: Increasing quantity for item:', item.id, 'Current:', item.quantity, 'New:', item.quantity + 1);
                                  await updateQuantity(item.id, item.quantity + 1);
                                } catch (error) {
                                  console.error('🛒 Cart: Error increasing quantity:', error);
                                }
                              }}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ₹{item.product.price * item.quantity}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  console.log('🛒 Cart: Removing item from cart:', item.id);
                                  await removeFromCart(item.id);
                                } catch (error) {
                                  console.error('🛒 Cart: Error removing item:', error);
                                }
                              }}
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
                          <span className="text-vendor-primary">₹{finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4">
                        <Button 
                          variant="vendor" 
                          className="w-full" 
                          size="lg"
                          onClick={handlePlaceOrder}
                          disabled={cartItems.length === 0}
                        >
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