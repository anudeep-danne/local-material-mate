import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Search, Plus, Minus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCartContext } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useProductReviews } from "@/hooks/useProductReviews";

const BrowseProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [quantityStates, setQuantityStates] = useState<Record<string, number>>({});
  const [productRatings, setProductRatings] = useState<Record<string, { averageRating: number; totalReviews: number }>>({});

  // Get authenticated user ID
  const { user } = useAuth();
  const vendorId = user?.id;
  
  const filters = {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    priceMin: priceRange === "50-100" ? 50 : priceRange === "100+" ? 100 : undefined,
    priceMax: priceRange === "0-50" ? 50 : priceRange === "50-100" ? 100 : undefined,
  };

  const { products, loading, error } = useProducts(filters);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCartContext();
  const { getProductRating } = useProductReviews();
  
  // Fetch product ratings
  useEffect(() => {
    const fetchProductRatings = async () => {
      const ratings: Record<string, { averageRating: number; totalReviews: number }> = {};
      
      for (const product of products) {
        try {
          console.log(`Fetching rating for product: ${product.name} (ID: ${product.id}) from supplier: ${product.supplier_id}`);
          const rating = await getProductRating(product.id, product.supplier_id);
          if (rating) {
            console.log(`Product ${product.name} rating: ${rating.averageRating} (${rating.totalReviews} reviews)`);
            ratings[product.id] = {
              averageRating: rating.averageRating,
              totalReviews: rating.totalReviews
            };
          } else {
            console.log(`No rating found for product: ${product.name}`);
          }
        } catch (error) {
          console.error(`Error fetching rating for product ${product.id}:`, error);
        }
      }
      
      console.log('Final product ratings:', ratings);
      setProductRatings(ratings);
    };

    if (products.length > 0) {
      fetchProductRatings();
    }
  }, [products, getProductRating]);

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
    
    // Update local state immediately for better UX
    setQuantityStates(prev => ({ ...prev, [productId]: newQuantity }));
    
    const cartItem = cartItems.find(item => item.product_id === productId);
    
    if (cartItem && cartItem.id) {
      try {
        await updateQuantity(cartItem.id, newQuantity);
      } catch (error) {
        console.error('Error updating cart item quantity:', error);
        
        // If update fails, try to remove the item and add it again
        try {
          // Remove the existing item
          await removeFromCart(cartItem.id);
          
          // Add the item with new quantity
          await addToCart(productId, newQuantity);
        } catch (fallbackError) {
          console.error('Remove and re-add approach failed:', fallbackError);
          // Revert local state on complete failure
          setQuantityStates(prev => ({ ...prev, [productId]: cartItem.quantity }));
        }
      }
    } else {
      // Add new item to cart
      try {
        await addToCart(productId, newQuantity);
      } catch (error) {
        console.error('Error adding item to cart:', error);
        // Revert local state on failure
        setQuantityStates(prev => ({ ...prev, [productId]: 1 }));
      }
    }
  };

  const showQuantityCounter = (productId: string) => {
    const currentQuantity = getCurrentQuantity(productId);
    return currentQuantity > 0;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Browse Products</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading products...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Browse Products</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-lg text-destructive mb-4">Error loading products</div>
                <div className="text-sm text-muted-foreground mb-4">{error}</div>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

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
          <div className="p-6 space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products or suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">₹0 - ₹50</SelectItem>
                  <SelectItem value="50-100">₹50 - ₹100</SelectItem>
                  <SelectItem value="100+">₹100+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const currentQuantity = getCurrentQuantity(product.id);
                const quantityState = getQuantityState(product.id);
                const productRating = productRatings[product.id];
                
                return (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-muted-foreground text-center">
                            <div className="text-4xl mb-2">🥬</div>
                            <div className="text-sm">No Image</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.supplier.business_name || product.supplier.name}
                        </p>
                        
                        {/* Product Rating */}
                        {productRating && productRating.totalReviews > 0 && (
                          <div className="flex items-center gap-2">
                            {renderStars(productRating.averageRating)}
                            <span className={`text-sm font-semibold ${getRatingColor(productRating.averageRating)}`}>
                              {productRating.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({productRating.totalReviews})
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-vendor-primary">
                            ₹{product.price}
                          </span>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {showQuantityCounter(product.id) ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(product.id, quantityState - 1)}
                              disabled={quantityState <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{quantityState}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(product.id, quantityState + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete from cart"
                            onClick={() => {
                              const cartItem = cartItems.find(item => item.product_id === product.id);
                              if (cartItem && cartItem.id) {
                                removeFromCart(cartItem.id);
                              }
                            }}
                          >
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="vendor"
                          className="w-full"
                          onClick={() => handleQuantityChange(product.id, 1)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* No Products */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🥬</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BrowseProducts;