import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Search, Package, Star, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useAuth } from "@/hooks/useAuth";
import { useProductReviews } from "@/hooks/useProductReviews";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const MyProducts = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [productRatings, setProductRatings] = useState<{[key: string]: {averageRating: number, totalReviews: number}}>({});
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const supplierId = user?.id;
  const { products, loading: productsLoading, error, deleteProduct } = useSupplierProducts(supplierId || "");
  const { getProductRating } = useProductReviews();

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeletingProductId(productId);
      console.log('=== DELETE PRODUCT DEBUG ===');
      console.log('Product ID:', productId);
      console.log('Current user ID:', user?.id);
      console.log('Supplier ID from hook:', supplierId);
      
      const success = await deleteProduct(productId);
      if (!success) {
        toast.error("Failed to delete product. Check the console for more details.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while deleting the product.";
      toast.error(errorMessage);
      console.error("Full error details:", error);
      console.log('=== END DELETE DEBUG ===');
    } finally {
      setDeletingProductId(null);
    }
  };

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
    { value: "fruits", label: "Fruits" },
    { value: "others", label: "Others" },
  ];

  const FilterSection = () => (
    <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Category Filter Combobox */}
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent className="w-64 max-h-64 p-0">
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
            : allCategories
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

      <div className="text-sm text-muted-foreground flex items-center justify-center md:justify-start">
        Showing {filteredProducts.length} products
      </div>
    </div>
  );

  const MobileProductCard = ({ product }: { product: any }) => {
    const rating = productRatings[product.id];
    
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=150'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">{product.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {product.category}
                  </Badge>
                </div>
                <Badge className={`text-xs ${getStatusColor(product.stock)}`}>
                  {getStatusText(product.stock)}
                </Badge>
              </div>
              
              <p className="text-lg font-bold text-supplier-primary mb-2">
                ₹{product.price}
              </p>
              
              {/* Product Rating Display */}
              {rating && rating.totalReviews > 0 ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(rating.averageRating)}
                  </div>
                  <span className={`text-xs font-medium ${getRatingColor(rating.averageRating)}`}>
                    {rating.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({rating.totalReviews})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(0)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    No reviews
                  </span>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mb-3">
                Stock: {product.stock} units
              </p>
              
              <div className="flex gap-2">
                <Button 
                  variant="supplier-outline" 
                  size="sm"
                  className="flex-1 h-10"
                  onClick={() => navigate(`/supplier/edit-product/${product.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-10 text-destructive hover:text-destructive"
                      disabled={deletingProductId === product.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingProductId === product.id ? "..." : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                        {product.stock > 0 && (
                          <span className="block mt-2 text-yellow-600">
                            ⚠️ This product has {product.stock} units in stock.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Product
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const DesktopProductCard = ({ product }: { product: any }) => {
    const rating = productRatings[product.id];
    
    return (
      <Card>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    disabled={deletingProductId === product.id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingProductId === product.id ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                      {product.stock > 0 && (
                        <span className="block mt-2 text-yellow-600">
                          ⚠️ This product has {product.stock} units in stock.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Product
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">My Products</h1>
        <div className="ml-auto flex items-center gap-2">
          {isMobile && (
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSection />
                </div>
              </SheetContent>
            </Sheet>
          )}
          <Button 
            variant="supplier" 
            size={isMobile ? "sm" : "default"}
            className={isMobile ? "h-10 px-3" : ""}
            onClick={() => navigate('/supplier/add-product')}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isMobile ? "Add" : "Add Product"}
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 md:p-6">
        {/* Filters */}
        {!isMobile && (
          <div className="mb-8">
            <FilterSection />
          </div>
        )}

        {/* Products List */}
        {authLoading || productsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className={isMobile ? "p-0" : "p-6"}>
                  {isMobile ? (
                    <div className="flex">
                      <div className="w-24 h-24 bg-muted"></div>
                      <div className="flex-1 p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                        <div className="h-5 bg-muted rounded w-1/2"></div>
                        <div className="h-8 bg-muted rounded w-full"></div>
                      </div>
                    </div>
                  ) : (
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
                  )}
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
            {filteredProducts.map((product) => (
              <div key={product.id}>
                {isMobile ? (
                  <MobileProductCard product={product} />
                ) : (
                  <DesktopProductCard product={product} />
                )}
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !authLoading && !productsLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}

        {products.length === 0 && !authLoading && !productsLoading && (
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