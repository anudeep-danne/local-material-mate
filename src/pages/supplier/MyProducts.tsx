import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Search, Package, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useAuth } from "@/hooks/useAuth";
import { useProductReviews } from "@/hooks/useProductReviews";

const MyProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [productRatings, setProductRatings] = useState<{[key: string]: {averageRating: number, totalReviews: number}}>({});
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  const supplierId = user?.id;
  const { products, loading, error, deleteProduct } = useSupplierProducts(supplierId || "");
  const { getProductRating } = useProductReviews();

  // Fetch product ratings
  useEffect(() => {
    const fetchProductRatings = async () => {
      if (!supplierId || !products.length) return;

      const ratings: {[key: string]: {averageRating: number, totalReviews: number}} = {};
      
      for (const product of products) {
        try {
          const rating = await getProductRating(product.id, supplierId);
          if (rating) {
            ratings[product.id] = {
              averageRating: rating.averageRating,
              totalReviews: rating.totalReviews
            };
          }
        } catch (error) {
          console.error(`Error fetching rating for product ${product.id}:`, error);
        }
      }
      
      setProductRatings(ratings);
    };

    fetchProductRatings();
  }, [supplierId, products, getProductRating]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === "In Stock") matchesStatus = product.stock > 10;
    else if (selectedStatus === "Low Stock") matchesStatus = product.stock > 0 && product.stock <= 10;
    else if (selectedStatus === "Out of Stock") matchesStatus = product.stock === 0;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (stock: number) => {
    if (stock > 10) return "bg-green-500 text-white";
    if (stock > 0) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const getStatusText = (stock: number) => {
    if (stock > 10) return "In Stock";
    if (stock > 0) return "Low Stock";
    return "Out of Stock";
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return [...Array(5)].map((_, i) => {
      let starClass = "text-gray-300";
      if (i < fullStars) {
        starClass = "text-yellow-400 fill-current";
      } else if (i === fullStars && hasHalfStar) {
        starClass = "text-yellow-400 fill-current";
      }
      
      return (
        <Star key={i} className={`h-3 w-3 ${starClass}`} />
      );
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const allCategories = [
    { value: "all", label: "All Categories" },
    { value: "vegetables", label: "Vegetables" },
    { value: "grains", label: "Grains" },
    { value: "pulses", label: "Pulses" },
    { value: "spices", label: "Spices" },
    { value: "oils", label: "Oils" },
    { value: "dairy", label: "Dairy" },
    { value: "others", label: "Others" },
  ];

  return (
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-2xl font-semibold text-foreground">My Products</h1>
        <Button 
          variant="supplier" 
          className="ml-auto"
          onClick={() => navigate('/supplier/add-product')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </header>

          {/* Content */}
          <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
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
                  <div className="p-2 sticky top-0 bg-white z-10">
                    <input
                      type="text"
                      placeholder="Search category..."
                      className="w-full px-2 py-1 border rounded text-sm outline-none"
                      value={categorySearchTerm}
                      onChange={e => setCategorySearchTerm(e.target.value)}
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </div>
                  {(categorySearchTerm
                    ? allCategories.filter(cat => cat.label.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                    : allCategories.filter((cat, idx) => idx < 4 || cat.value === "all")
                  ).map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground flex items-center">
                Showing {filteredProducts.length} products
              </div>
            </div>

            {/* Products List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-muted rounded w-1/3"></div>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-6 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-8 bg-muted rounded w-16"></div>
                          <div className="h-8 bg-muted rounded w-16"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Error loading products: {error}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const rating = productRatings[product.id];
                  
                  return (
                    <Card key={product.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=150'}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                                <Badge variant="secondary" className="mb-2">
                                  {product.category}
                                </Badge>
                                <p className="text-2xl font-bold text-supplier-primary">
                                  ₹{product.price}
                                </p>
                                
                                {/* Product Rating Display */}
                                {rating && rating.totalReviews > 0 ? (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                      {renderStars(rating.averageRating)}
                                    </div>
                                    <span className={`text-sm font-medium ${getRatingColor(rating.averageRating)}`}>
                                      {rating.averageRating.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({rating.totalReviews} review{rating.totalReviews !== 1 ? 's' : ''})
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                      {renderStars(0)}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      No reviews yet
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <Badge className={getStatusColor(product.stock)}>
                                  {getStatusText(product.stock)}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Stock: {product.stock} units
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="supplier-outline" 
                              size="sm"
                              onClick={() => navigate(`/supplier/edit-product/${product.id}`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            )}

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Package className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                  <p>Start by adding your first product to the catalog.</p>
                </div>
                <Button 
                  variant="supplier" 
                  onClick={() => navigate('/supplier/add-product')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            )}
          </div>
        </>
      );
};

export default MyProducts;