import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Search } from "lucide-react";
import { useState } from "react";

// Sample product data
const products = [
  {
    id: 1,
    name: "Fresh Onions",
    supplier: "Kumar Vegetables",
    price: 45,
    unit: "kg",
    stock: 50,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300",
    category: "Vegetables"
  },
  {
    id: 2,
    name: "Fresh Tomatoes",
    supplier: "Sharma Traders",
    price: 35,
    unit: "kg",
    stock: 30,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300",
    category: "Vegetables"
  },
  {
    id: 3,
    name: "Cooking Oil",
    supplier: "Patel Oil Mills",
    price: 120,
    unit: "L",
    stock: 25,
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=300",
    category: "Oil"
  },
  {
    id: 4,
    name: "Spice Mix",
    supplier: "Gupta Spices",
    price: 80,
    unit: "kg",
    stock: 15,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300",
    category: "Spices"
  },
  {
    id: 5,
    name: "Basmati Rice",
    supplier: "Rice Valley",
    price: 120,
    unit: "kg",
    stock: 40,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300",
    category: "Grains"
  },
  {
    id: 6,
    name: "Fresh Potatoes",
    supplier: "Kumar Vegetables",
    price: 25,
    unit: "kg",
    stock: 60,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300",
    category: "Vegetables"
  }
];

const BrowseProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange === "0-50") matchesPrice = product.price <= 50;
    else if (priceRange === "50-100") matchesPrice = product.price > 50 && product.price <= 100;
    else if (priceRange === "100+") matchesPrice = product.price > 100;

    return matchesSearch && matchesCategory && matchesPrice;
  });

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
                  <SelectItem value="Oil">Oil</SelectItem>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.supplier}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-vendor-primary">
                        ₹{product.price}/{product.unit}
                      </span>
                      <Badge variant="secondary">
                        Stock: {product.stock}{product.unit}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-1">
                        {product.rating}
                      </span>
                    </div>

                    <Button variant="vendor" className="w-full">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
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