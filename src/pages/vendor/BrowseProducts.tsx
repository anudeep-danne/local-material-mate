import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Search, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCartContext } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";

const BrowseProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [quantityStates, setQuantityStates] = useState<Record<string, number>>({});

  // Get authenticated user ID
  const { user } = useAuth();
  const vendorId = user?.id || "22222222-2222-2222-2222-222222222222"; // Fallback to real vendor account
  
  // Debug: Log vendor ID and user info
  console.log('🛒 BrowseProducts: User info:', user);
  console.log('🛒 BrowseProducts: Vendor ID being used:', vendorId);
  console.log('🛒 BrowseProducts: User authenticated:', !!user);
  console.log('🛒 BrowseProducts: User ID:', user?.id);
  console.log('🛒 BrowseProducts: User role:', user?.role);
  
  const filters = {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    priceMin: priceRange === "50-100" ? 50 : priceRange === "100+" ? 100 : undefined,
    priceMax: priceRange === "0-50" ? 50 : priceRange === "50-100" ? 100 : undefined,
  };

  const { products, loading, error } = useProducts(filters);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCartContext();
  
  // Debug: Log cart items when they change
  console.log('🛒 BrowseProducts: Current cart items:', cartItems);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.supplier.business_name && product.supplier.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
    || (product.supplier.name && product.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get current quantity for a product
  const getCurrentQuantity = (productId: string) => {
    const cartItem = cartItems.find(item => item.product_id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Get quantity state for a product
  const getQuantityState = (productId: string) => {
    if (quantityStates[productId] !== undefined) {
      return quantityStates[productId];
    }
    return getCurrentQuantity(productId) || 1;
  };

  // Handle quantity change and immediately update cart
  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    console.log('🛒 BrowseProducts: Handling quantity change - Product ID:', productId, 'New quantity:', newQuantity);
    console.log('🛒 BrowseProducts: Current cart items:', cartItems.map(item => ({ id: item.id, product_id: item.product_id, quantity: item.quantity })));
    
    // Update local state immediately for better UX
    setQuantityStates(prev => ({ ...prev, [productId]: newQuantity }));
    
    const cartItem = cartItems.find(item => item.product_id === productId);
    console.log('🛒 BrowseProducts: Found cart item:', cartItem);
    
    if (cartItem && cartItem.id) {
      console.log('🛒 BrowseProducts: Updating existing cart item:', cartItem.id, 'Current quantity:', cartItem.quantity, 'New quantity:', newQuantity);
      try {
        await updateQuantity(cartItem.id, newQuantity);
        console.log('🛒 BrowseProducts: Successfully updated cart item quantity');
      } catch (error) {
        console.error('🛒 BrowseProducts: Error updating cart item quantity:', error);
        
        // If update fails, try to remove the item and add it again
        console.log('🛒 BrowseProducts: Trying remove and re-add approach');
        try {
          // Remove the existing item
          await removeFromCart(cartItem.id);
          console.log('🛒 BrowseProducts: Removed existing cart item');
          
          // Add the item with new quantity
          await addToCart(productId, newQuantity);
          console.log('🛒 BrowseProducts: Successfully re-added item with new quantity');
        } catch (fallbackError) {
          console.error('🛒 BrowseProducts: Remove and re-add approach failed:', fallbackError);
          // Revert local state on complete failure
          setQuantityStates(prev => ({ ...prev, [productId]: cartItem.quantity }));
        }
      }
    } else {
      console.log('🛒 BrowseProducts: Adding new item to cart');
      try {
        await addToCart(productId, newQuantity);
        console.log('🛒 BrowseProducts: Successfully added new item to cart');
      } catch (error) {
        console.error('🛒 BrowseProducts: Error adding new item to cart:', error);
        // Revert local state on failure
        setQuantityStates(prev => ({ ...prev, [productId]: 1 }));
      }
    }
  };

  // Show quantity counter for a product
  const showQuantityCounter = (productId: string) => {
    return getCurrentQuantity(productId) > 0 || quantityStates[productId] !== undefined;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <VendorSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">Browse Products</h1>
          </header>

          {/* Content */}
          <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Spices">Spices</SelectItem>
                  <SelectItem value="Oils">Oils</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">₹0 - ₹50</SelectItem>
                  <SelectItem value="50-100">₹50 - ₹100</SelectItem>
                  <SelectItem value="100+">₹100+</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-high">Highest Rated</SelectItem>
                  <SelectItem value="rating-low">Lowest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

            </div>

            {/* Results */}
            <div className="mb-4">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} products
              </p>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted"></div>
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Error loading products: {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=300'}
                        alt={product.name}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {product.supplier.business_name || product.supplier.name || "Supplier Name Not Set"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          📍 {product.supplier.city || 'Location Not Set'}{product.supplier.state ? `, ${product.supplier.state}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          📞 {product.supplier.phone || 'Phone Not Set'}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-vendor-primary">
                          ₹{product.price}
                        </span>
                        <Badge variant="secondary">
                          Stock: {product.stock}
                        </Badge>
                      </div>

                      {showQuantityCounter(product.id) ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, getQuantityState(product.id) - 1)}
                            disabled={getQuantityState(product.id) <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {getQuantityState(product.id)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, getQuantityState(product.id) + 1)}
                            disabled={getQuantityState(product.id) >= product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="vendor" 
                          className="w-full"
                          onClick={async () => {
                            try {
                              console.log('🛒 BrowseProducts: Add to cart button clicked for product:', product.id);
                              console.log('🛒 BrowseProducts: Current vendor ID:', vendorId);
                              console.log('🛒 BrowseProducts: Product details:', { id: product.id, name: product.name, price: product.price });
                              setQuantityStates(prev => ({ ...prev, [product.id]: 1 }));
                              console.log('🛒 BrowseProducts: Calling addToCart with:', { productId: product.id, quantity: 1, vendorId });
                              await addToCart(product.id, 1);
                              console.log('🛒 BrowseProducts: Successfully added product to cart:', product.id);
                            } catch (error) {
                              console.error('🛒 BrowseProducts: Error adding product to cart:', error);
                              console.error('🛒 BrowseProducts: Error details:', { message: error.message, stack: error.stack });
                              // Revert local state on failure
                              setQuantityStates(prev => ({ ...prev, [product.id]: 0 }));
                            }
                          }}
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BrowseProducts;