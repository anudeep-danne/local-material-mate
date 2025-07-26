import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Search, Minus, Plus, MapPin } from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { getCurrentLocation } from "@/lib/utils";

const BrowseProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [radiusFilter, setRadiusFilter] = useState("all");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Using vendor ID for demo - in real app this would come from auth
  const vendorId = "11111111-1111-1111-1111-111111111111";
  
  const filters = {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    priceMin: priceRange === "50-100" ? 50 : priceRange === "100+" ? 100 : undefined,
    priceMax: priceRange === "0-50" ? 50 : priceRange === "50-100" ? 100 : undefined,
    location: locationFilter || undefined,
    radius: radiusFilter === "all" ? undefined : parseInt(radiusFilter)
  };

  const { products, loading, error } = useProducts(filters);
  const { cartItems, addToCart, updateQuantity } = useCart(vendorId);

  const handleUseMyLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      // For demo purposes, we'll set a default city based on coordinates
      // In a real app, you'd use a reverse geocoding service
      const cities = [
        { name: "Delhi", lat: 28.7041, lon: 77.1025 },
        { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
        { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
        { name: "Kolkata", lat: 22.5726, lon: 88.3639 }
      ];
      
      // Find the closest city
      let closestCity = cities[0];
      let minDistance = Infinity;
      
      cities.forEach(city => {
        const distance = Math.sqrt(
          Math.pow(location.latitude - city.lat, 2) + 
          Math.pow(location.longitude - city.lon, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      });
      
      setLocationFilter(closestCity.name);
      if (radiusFilter === "all") {
        setRadiusFilter("25"); // Default to 25km radius
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUseMyLocation}
                  disabled={isGettingLocation}
                  title="Use my location"
                >
                  {isGettingLocation ? (
                    <div className="animate-spin h-4 w-4 border-2 border-vendor-primary border-t-transparent rounded-full"></div>
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Select value={radiusFilter} onValueChange={setRadiusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Distance</SelectItem>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="25">Within 25 km</SelectItem>
                  <SelectItem value="50">Within 50 km</SelectItem>
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
                        <p className="text-sm text-muted-foreground">{product.supplier.name}</p>
                        {(product.supplier.city || product.supplier.state) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {[product.supplier.city, product.supplier.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        {product.supplier.averageRating && product.supplier.averageRating > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.round(product.supplier.averageRating!)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {product.supplier.averageRating.toFixed(1)} ({product.supplier.totalReviews} reviews)
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No reviews yet</p>
                        )}
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

                      {(() => {
                        const cartItem = cartItems.find((item) => item.product_id === product.id);
                        if (cartItem) {
                          return (
                            <div className="flex items-center justify-center gap-3 bg-white/80 border border-gray-200 rounded-lg py-2 px-4 shadow-sm">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                                disabled={cartItem.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Badge variant="secondary" className="text-base px-3 py-1 rounded-full bg-vendor-primary/10 text-vendor-primary border border-vendor-primary font-bold">
                                {cartItem.quantity}
                              </Badge>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                disabled={cartItem.quantity >= product.stock}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        } else {
                          return (
                            <Button
                              variant="vendor"
                              className="w-full mt-2"
                              onClick={() => addToCart(product.id)}
                              disabled={product.stock === 0}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                          );
                        }
                      })()}
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