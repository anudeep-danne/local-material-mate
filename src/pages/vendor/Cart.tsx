import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const Cart = () => {
  // Get authenticated user ID
  const { user } = useAuth();
  const isMobile = useIsMobile();
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
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">My Cart</h1>
        <Badge variant="secondary" className="ml-auto">
          {cartItems.length} items
        </Badge>
      </header>

      {/* Content */}
      <div className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg md:text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              Browse our products and add items to your cart.
            </p>
            <Button variant="vendor">Start Shopping</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg md:text-xl font-semibold">Cart Items</h2>
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <img
                        src={item.product.image_url || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=150'}
                        alt={item.product.name}
                        className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{item.product.name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">{item.product.category}</p>
                        <p className="text-xs md:text-sm text-vendor-primary font-medium truncate">
                          {item.product.supplier?.business_name || item.product.supplier?.name}
                        </p>
                        <p className="text-vendor-primary font-semibold text-sm md:text-base">
                          ₹{item.product.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 md:h-10 md:w-10"
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
                          <Minus className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <span className="text-sm md:text-base font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 md:h-10 md:w-10"
                          onClick={async () => {
                            try {
                              console.log('🛒 Cart: Increasing quantity for item:', item.id, 'Current:', item.quantity, 'New:', item.quantity + 1);
                              await updateQuantity(item.id, item.quantity + 1);
                            } catch (error) {
                              console.error('🛒 Cart: Error increasing quantity:', error);
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 md:h-10 md:w-10 text-destructive"
                          onClick={async () => {
                            try {
                              console.log('🛒 Cart: Removing item:', item.id);
                              await removeFromCart(item.id);
                            } catch (error) {
                              console.error('🛒 Cart: Error removing item:', error);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-sm md:text-base">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-base md:text-lg">
                      <span>Total</span>
                      <span>₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4">
                    <Button 
                      variant="vendor" 
                      className="w-full h-10 md:h-10"
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-10 md:h-10"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;