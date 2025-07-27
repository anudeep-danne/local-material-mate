import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Clock, MapPin, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProductComparison } from "@/hooks/useProductComparison";
import { useAuth } from "@/hooks/useAuth";

const CompareSuppliers = () => {
  // Get authenticated user ID
  const { user } = useAuth();
  const vendorId = user?.id || "22222222-2222-2222-2222-222222222222"; // Fallback to real vendor account
  const { suppliers, loading, error, getRecentSuppliers } = useSuppliers(vendorId);
  const [recentSuppliers, setRecentSuppliers] = useState<any[]>([]);
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  const [supplier1, setSupplier1] = useState<string>("");
  const [supplier2, setSupplier2] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const selectedSupplier1 = suppliers.find(s => s.id === supplier1);
  const selectedSupplier2 = suppliers.find(s => s.id === supplier2);

  // Get product comparison data
  const supplierIds = [supplier1, supplier2].filter(Boolean);
  const { products: productsBySupplier, loading: productsLoading, getAllProductNames, getProductByName } = useProductComparison(supplierIds);

  const availableProducts = getAllProductNames();
  const selectedProduct1 = selectedProduct ? getProductByName(supplier1, selectedProduct) : null;
  const selectedProduct2 = selectedProduct ? getProductByName(supplier2, selectedProduct) : null;

  // Get common products between suppliers
  const getCommonProducts = () => {
    if (!supplier1 || !supplier2) return [];
    const supplier1Products = productsBySupplier[supplier1] || [];
    const supplier2Products = productsBySupplier[supplier2] || [];
    
    const supplier1Names = new Set(supplier1Products.map(p => p.name));
    const supplier2Names = new Set(supplier2Products.map(p => p.name));
    
    return Array.from(supplier1Names).filter(name => supplier2Names.has(name));
  };

  const commonProducts = getCommonProducts();

  useEffect(() => {
    const fetchRecentSuppliers = async () => {
      const recent = await getRecentSuppliers();
      setRecentSuppliers(recent);
    };
    fetchRecentSuppliers();
  }, [getRecentSuppliers]);

  const availableSuppliers = showRecentOnly ? recentSuppliers : suppliers;

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

  const renderProductComparison = () => {
    if (!selectedProduct) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Product Price Comparison</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Supplier 1 Product */}
          <Card className="border-vendor-primary/30">
            <CardHeader className="bg-vendor-secondary/30">
              <CardTitle className="text-vendor-primary text-base">{selectedSupplier1?.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedProduct1 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedProduct1.name}</span>
                    <Badge variant="secondary">{selectedProduct1.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price per kg</span>
                    <span className="text-lg font-bold text-vendor-primary">₹{selectedProduct1.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stock Available</span>
                    <span className="font-semibold">{selectedProduct1.stock} kg</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Product not available</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier 2 Product */}
          <Card className="border-supplier-primary/30">
            <CardHeader className="bg-supplier-secondary/30">
              <CardTitle className="text-supplier-primary text-base">{selectedSupplier2?.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedProduct2 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedProduct2.name}</span>
                    <Badge variant="secondary">{selectedProduct2.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price per kg</span>
                    <span className="text-lg font-bold text-supplier-primary">₹{selectedProduct2.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stock Available</span>
                    <span className="font-semibold">{selectedProduct2.stock} kg</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Product not available</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Price Difference */}
        {selectedProduct1 && selectedProduct2 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Price Analysis</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Price Difference:</span>
                <span className={`ml-2 font-semibold ${selectedProduct1.price > selectedProduct2.price ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{Math.abs(selectedProduct1.price - selectedProduct2.price)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Percentage Difference:</span>
                <span className={`ml-2 font-semibold ${selectedProduct1.price > selectedProduct2.price ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.abs(((selectedProduct1.price - selectedProduct2.price) / selectedProduct2.price) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Better Deal:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {selectedProduct1.price < selectedProduct2.price ? selectedSupplier1?.name : selectedSupplier2?.name}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSupplierProducts = () => {
    if (!selectedSupplier1 || !selectedSupplier2) return null;

    const supplier1Products = productsBySupplier[supplier1] || [];
    const supplier2Products = productsBySupplier[supplier2] || [];

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Available Products</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Supplier 1 Products */}
          <Card className="border-vendor-primary/30">
            <CardHeader className="bg-vendor-secondary/30">
              <CardTitle className="text-vendor-primary text-base">{selectedSupplier1.name} Products</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {supplier1Products.length > 0 ? (
                <div className="space-y-2">
                  {supplier1Products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div>
                        <span className="font-medium text-sm">{product.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{product.category}</Badge>
                      </div>
                      <span className="font-semibold text-sm">₹{product.price}/kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <span>No products available</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier 2 Products */}
          <Card className="border-supplier-primary/30">
            <CardHeader className="bg-supplier-secondary/30">
              <CardTitle className="text-supplier-primary text-base">{selectedSupplier2.name} Products</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {supplier2Products.length > 0 ? (
                <div className="space-y-2">
                  {supplier2Products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div>
                        <span className="font-medium text-sm">{product.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{product.category}</Badge>
                      </div>
                      <span className="font-semibold text-sm">₹{product.price}/kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <span>No products available</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderComparisonSummary = () => {
    if (!selectedSupplier1 || !selectedSupplier2) return null;

    const supplier1Products = productsBySupplier[supplier1] || [];
    const supplier2Products = productsBySupplier[supplier2] || [];
    
    const avgPrice1 = supplier1Products.length > 0 
      ? supplier1Products.reduce((sum, p) => sum + p.price, 0) / supplier1Products.length 
      : 0;
    const avgPrice2 = supplier2Products.length > 0 
      ? supplier2Products.reduce((sum, p) => sum + p.price, 0) / supplier2Products.length 
      : 0;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Comparison Summary</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Products</span>
                  <span className="font-semibold">{supplier1Products.length} vs {supplier2Products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Common Products</span>
                  <span className="font-semibold">{commonProducts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Price</span>
                  <span className="font-semibold">₹{avgPrice1.toFixed(0)} vs ₹{avgPrice2.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price Difference</span>
                  <span className={`font-semibold ${avgPrice1 > avgPrice2 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{Math.abs(avgPrice1 - avgPrice2).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <span className="font-semibold">{selectedSupplier1.averageRating.toFixed(1)} vs {selectedSupplier2.averageRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviews</span>
                  <span className="font-semibold">{selectedSupplier1.totalReviews} vs {selectedSupplier2.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Better Overall Rating</span>
                  <span className="font-semibold text-green-600">
                    {selectedSupplier1.averageRating > selectedSupplier2.averageRating ? selectedSupplier1.name : selectedSupplier2.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Better Average Price</span>
                  <span className="font-semibold text-green-600">
                    {avgPrice1 < avgPrice2 ? selectedSupplier1.name : selectedSupplier2.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Compare Suppliers</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-vendor-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading suppliers...</p>
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
              <h1 className="text-2xl font-semibold text-foreground">Compare Suppliers</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-12 text-destructive">
                Error loading suppliers: {error}
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
            <h1 className="text-2xl font-semibold text-foreground">Compare Suppliers</h1>
          </header>

          {/* Content */}
          <div className="p-6">
            {/* Filter Options */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRecentOnly}
                  onChange={(e) => setShowRecentOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show only suppliers from recent orders</span>
              </label>
            </div>

            {/* Supplier Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-sm font-medium mb-2 block">Select First Supplier</label>
                <Select value={supplier1} onValueChange={setSupplier1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Select Second Supplier</label>
                <Select value={supplier2} onValueChange={setSupplier2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Selection */}
            {selectedSupplier1 && selectedSupplier2 && (
              <div className="mb-8">
                <label className="text-sm font-medium mb-2 block">Select Product to Compare</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product to compare prices" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((productName) => {
                      const isCommon = commonProducts.includes(productName);
                      const supplier1Has = getProductByName(supplier1, productName);
                      const supplier2Has = getProductByName(supplier2, productName);
                      
                      return (
                        <SelectItem key={productName} value={productName}>
                          <div className="flex items-center justify-between w-full">
                            <span>{productName}</span>
                            <div className="flex gap-1 ml-2">
                              {isCommon && (
                                <Badge variant="secondary" className="text-xs">Common</Badge>
                              )}
                              {supplier1Has && (
                                <Badge variant="outline" className="text-xs text-vendor-primary">₹{supplier1Has.price}</Badge>
                              )}
                              {supplier2Has && (
                                <Badge variant="outline" className="text-xs text-supplier-primary">₹{supplier2Has.price}</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {productsLoading && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Loading product data...
                  </div>
                )}
                {commonProducts.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    💡 {commonProducts.length} common product{commonProducts.length > 1 ? 's' : ''} available for comparison
                  </div>
                )}
              </div>
            )}

            {/* Product Price Comparison */}
            {renderProductComparison()}

            {/* Available Products */}
            {renderSupplierProducts()}

            {/* Comparison Summary */}
            {renderComparisonSummary()}

            {/* Supplier Comparison */}
            {selectedSupplier1 && selectedSupplier2 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Supplier 1 */}
                <Card className="border-vendor-primary/30">
                  <CardHeader className="bg-vendor-secondary/30">
                    <CardTitle className="text-vendor-primary">{selectedSupplier1.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(selectedSupplier1.averageRating)}</div>
                      <span className="text-sm font-semibold">{selectedSupplier1.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({selectedSupplier1.totalReviews} reviews)</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Products</span>
                        </div>
                        <span className="font-semibold">{selectedSupplier1.productsCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Average Price</span>
                        </div>
                        <span className="font-semibold">₹{selectedSupplier1.averagePrice.toFixed(0)}/kg</span>
                      </div>

                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier1.specialties?.map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                        {(!selectedSupplier1.specialties || selectedSupplier1.specialties.length === 0) && (
                          <span className="text-sm text-muted-foreground">No specialties listed</span>
                        )}
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* Supplier 2 */}
                <Card className="border-supplier-primary/30">
                  <CardHeader className="bg-supplier-secondary/30">
                    <CardTitle className="text-supplier-primary">{selectedSupplier2.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(selectedSupplier2.averageRating)}</div>
                      <span className="text-sm font-semibold">{selectedSupplier2.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({selectedSupplier2.totalReviews} reviews)</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Products</span>
                        </div>
                        <span className="font-semibold">{selectedSupplier2.productsCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Average Price</span>
                        </div>
                        <span className="font-semibold">₹{selectedSupplier2.averagePrice.toFixed(0)}/kg</span>
                      </div>

                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier2.specialties?.map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                        {(!selectedSupplier2.specialties || selectedSupplier2.specialties.length === 0) && (
                          <span className="text-sm text-muted-foreground">No specialties listed</span>
                        )}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  Select two suppliers to compare their offerings, ratings, and delivery options.
                </div>
                {availableSuppliers.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    {showRecentOnly ? "No recent suppliers found. Try unchecking the filter to see all suppliers." : "No suppliers available."}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CompareSuppliers;