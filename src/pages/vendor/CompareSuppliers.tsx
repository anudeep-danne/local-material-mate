import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Package, Clock, MapPin, AlertCircle, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProductComparison } from "@/hooks/useProductComparison";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useProductReviews } from "@/hooks/useProductReviews";

const CompareSuppliers = () => {
  // Get authenticated user ID
  const { user } = useAuth();
  const vendorId = user?.id;
  const { suppliers, loading, error, getRecentSuppliers } = useSuppliers(vendorId);
  const [recentSuppliers, setRecentSuppliers] = useState<any[]>([]);
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [supplier1, setSupplier1] = useState<string>("");
  const [supplier2, setSupplier2] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  const selectedSupplier1 = suppliers.find(s => s.id === supplier1);
  const selectedSupplier2 = suppliers.find(s => s.id === supplier2);

  // Get all products from all suppliers for product selection
  const allSupplierIds = suppliers.map(s => s.id);
  const { products: productsBySupplier, loading: productsLoading, getAllProductNames, getProductByName } = useProductComparison(allSupplierIds);

  const availableProducts = getAllProductNames();
  const selectedProduct1 = selectedProduct ? getProductByName(supplier1, selectedProduct) : null;
  const selectedProduct2 = selectedProduct ? getProductByName(supplier2, selectedProduct) : null;

  // Get suppliers that have the selected product
  const getSuppliersWithProduct = useCallback((productName: string) => {
    return suppliers.filter(supplier => {
      const supplierProducts = productsBySupplier[supplier.id] || [];
      return supplierProducts.some(product => product.name === productName);
    });
  }, [suppliers, productsBySupplier]);

  const suppliersWithSelectedProduct = selectedProduct ? getSuppliersWithProduct(selectedProduct) : [];

  // Filter products based on search
  const getFilteredProducts = useCallback(() => {
    if (!productSearch.trim()) {
      // Show top products (most popular by supplier count) when no search
      return availableProducts
        .map(productName => ({
          name: productName,
          supplierCount: getSuppliersWithProduct(productName).length
        }))
        .sort((a, b) => b.supplierCount - a.supplierCount)
        .slice(0, 10) // Show top 10 products
        .map(item => item.name);
    }
    
    // Filter by search term
    return availableProducts.filter(productName =>
      productName.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch, availableProducts, getSuppliersWithProduct]);

  const filteredProducts = getFilteredProducts();

  const { getProductRating } = useProductReviews();
  const [productRatings, setProductRatings] = useState<{ [key: string]: { [supplierId: string]: { averageRating: number, totalReviews: number } } }>({});

  // Fetch product ratings for both suppliers for the selected product
  useEffect(() => {
    const fetchRatings = async () => {
      if (!selectedProduct) return;
      const ratings: { [key: string]: { [supplierId: string]: { averageRating: number, totalReviews: number } } } = {};
      for (const supplier of [selectedSupplier1, selectedSupplier2]) {
        if (supplier && selectedProduct) {
          const rating = await getProductRating(getProductByName(supplier.id, selectedProduct)?.id, supplier.id);
          if (!ratings[selectedProduct]) ratings[selectedProduct] = {};
          ratings[selectedProduct][supplier.id] = {
            averageRating: rating?.averageRating || 0,
            totalReviews: rating?.totalReviews || 0
          };
        }
      }
      setProductRatings(ratings);
    };
    fetchRatings();
  }, [selectedProduct, selectedSupplier1, selectedSupplier2, getProductRating]);

  // Memoize the fetch recent suppliers function
  const fetchRecentSuppliers = useCallback(async () => {
    if (!vendorId) {
      setRecentSuppliers([]);
      return;
    }
    
    try {
      const recent = await getRecentSuppliers();
      setRecentSuppliers(recent);
    } catch (error) {
      console.error('Error fetching recent suppliers:', error);
      setRecentSuppliers([]);
    }
  }, [vendorId, getRecentSuppliers]);

  useEffect(() => {
    fetchRecentSuppliers();
  }, [fetchRecentSuppliers]);

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
    if (!selectedProduct || !selectedSupplier1 || !selectedSupplier2) return null;

    const rating1 = productRatings[selectedProduct]?.[selectedSupplier1.id];
    const rating2 = productRatings[selectedProduct]?.[selectedSupplier2.id];

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Product Price Comparison</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Supplier 1 Product */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-600">
                {selectedSupplier1.business_name || selectedSupplier1.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProduct1 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{selectedProduct1.name}</span>
                    <Badge variant="secondary">{selectedProduct1.category}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{selectedProduct1.price}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Stock: {selectedProduct1.stock} units</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedSupplier1.city || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(rating1?.averageRating || 0)}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({rating1?.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-semibold">Product not available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This supplier doesn't carry {selectedProduct}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier 2 Product */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-600">
                {selectedSupplier2.business_name || selectedSupplier2.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProduct2 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{selectedProduct2.name}</span>
                    <Badge variant="secondary">{selectedProduct2.category}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{selectedProduct2.price}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Stock: {selectedProduct2.stock} units</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedSupplier2.city || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(rating2?.averageRating || 0)}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({rating2?.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-semibold">Product not available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This supplier doesn't carry {selectedProduct}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Price Analysis */}
        {selectedProduct1 && selectedProduct2 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Price Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{selectedProduct1.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedSupplier1.business_name || selectedSupplier1.name}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-lg font-semibold text-muted-foreground">
                    vs
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{selectedProduct2.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedSupplier2.business_name || selectedSupplier2.name}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                {selectedProduct1.price < selectedProduct2.price ? (
                  <div className="text-green-600 font-semibold">
                    {selectedSupplier1.business_name || selectedSupplier1.name} offers better price
                  </div>
                ) : selectedProduct1.price > selectedProduct2.price ? (
                  <div className="text-green-600 font-semibold">
                    {selectedSupplier2.business_name || selectedSupplier2.name} offers better price
                  </div>
                ) : (
                  <div className="text-blue-600 font-semibold">
                    Both suppliers offer the same price
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Detailed Comparison Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detailed Comparison of Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Supplier 1 Details Card */}
              <Card className="border border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-600">{selectedSupplier1.business_name || selectedSupplier1.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-t pt-3">
                    <h5 className="font-semibold mb-1">Supplier Details</h5>
                    <ul className="list-disc ml-6 text-xs text-muted-foreground space-y-1 mb-4">
                      <li>Business Name: {selectedSupplier1.business_name || 'N/A'}</li>
                      <li>Contact: {selectedSupplier1.phone || 'N/A'}</li>
                      <li>Email: {selectedSupplier1.email || 'N/A'}</li>
                      <li>Address: {selectedSupplier1.address || 'N/A'}</li>
                      <li>City: {selectedSupplier1.city || 'N/A'}</li>
                      <li>State: {selectedSupplier1.state || 'N/A'}</li>
                      <li>Total Products: {selectedSupplier1.productsCount || 'N/A'}</li>
                      <li>Specialties: {(selectedSupplier1.specialties && selectedSupplier1.specialties.length > 0) ? selectedSupplier1.specialties.join(', ') : 'N/A'}</li>
                      <li>Average Supplier Rating: {selectedSupplier1.averageRating?.toFixed(1) || 'N/A'} ({selectedSupplier1.totalReviews || 0} reviews)</li>
                    </ul>
                    <div className="mt-4">
                      <h5 className="font-semibold mb-1">Available Products</h5>
                      <ul className="list-disc ml-6 text-xs text-muted-foreground space-y-1">
                        {(productsBySupplier[selectedSupplier1.id] && productsBySupplier[selectedSupplier1.id].length > 0) ? (
                          productsBySupplier[selectedSupplier1.id].map((product: any) => (
                            <li key={product.id}>{product.name} (₹{product.price})</li>
                          ))
                        ) : (
                          <li>No products available</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Supplier 2 Details Card */}
              <Card className="border border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-600">{selectedSupplier2.business_name || selectedSupplier2.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-t pt-3">
                    <h5 className="font-semibold mb-1">Supplier Details</h5>
                    <ul className="list-disc ml-6 text-xs text-muted-foreground space-y-1 mb-4">
                      <li>Business Name: {selectedSupplier2.business_name || 'N/A'}</li>
                      <li>Contact: {selectedSupplier2.phone || 'N/A'}</li>
                      <li>Email: {selectedSupplier2.email || 'N/A'}</li>
                      <li>Address: {selectedSupplier2.address || 'N/A'}</li>
                      <li>City: {selectedSupplier2.city || 'N/A'}</li>
                      <li>State: {selectedSupplier2.state || 'N/A'}</li>
                      <li>Total Products: {selectedSupplier2.productsCount || 'N/A'}</li>
                      <li>Specialties: {(selectedSupplier2.specialties && selectedSupplier2.specialties.length > 0) ? selectedSupplier2.specialties.join(', ') : 'N/A'}</li>
                      <li>Average Supplier Rating: {selectedSupplier2.averageRating?.toFixed(1) || 'N/A'} ({selectedSupplier2.totalReviews || 0} reviews)</li>
                    </ul>
                    <div className="mt-4">
                      <h5 className="font-semibold mb-1">Available Products</h5>
                      <ul className="list-disc ml-6 text-xs text-muted-foreground space-y-1">
                        {(productsBySupplier[selectedSupplier2.id] && productsBySupplier[selectedSupplier2.id].length > 0) ? (
                          productsBySupplier[selectedSupplier2.id].map((product: any) => (
                            <li key={product.id}>{product.name} (₹{product.price})</li>
                          ))
                        ) : (
                          <li>No products available</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
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
              <div className="text-center py-8">
                <div className="text-lg text-destructive mb-4">Error loading suppliers</div>
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
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Compare Suppliers</h1>
      </header>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-8">
            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-vendor-primary">Product Selection with Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Product to Compare</label>
                  <Select 
                    value={selectedProduct} 
                    onValueChange={setSelectedProduct}
                    onOpenChange={setIsProductDropdownOpen}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a product to compare prices" />
                    </SelectTrigger>
                    <SelectContent className="w-[400px] max-h-[340px] p-0">
                      {/* Enhanced Search Bar - always visible, not inside scrollable area */}
                      <div className="sticky top-0 z-10 bg-white p-2 border-b flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground ml-2" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          autoFocus={isProductDropdownOpen}
                          className="flex-1 px-2 py-1 bg-transparent outline-none text-sm"
                          onKeyDown={e => e.stopPropagation()}
                        />
                        {productSearch && (
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground hover:text-destructive"
                            onClick={() => setProductSearch("")}
                            tabIndex={0}
                            aria-label="Clear search"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {/* Product List - scrollable */}
                      <div className="max-h-[220px] overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((productName) => {
                            const supplierCount = getSuppliersWithProduct(productName).length;
                            return (
                              <SelectItem key={productName} value={productName} className="flex items-center justify-between w-full">
                                <span>{productName}</span>
                                <Badge variant="secondary" className="ml-2">
                                  {supplierCount} supplier{supplierCount !== 1 ? 's' : ''}
                                </Badge>
                              </SelectItem>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-muted-foreground text-sm">No products found</div>
                        )}
                      </div>
                      {productSearch.trim() && (
                        <div className="p-2 border-t bg-muted/10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setProductSearch("")}
                            className="w-full"
                          >
                            Clear search and show all products
                          </Button>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {!productSearch.trim() && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Showing top {Math.min(10, filteredProducts.length)} most popular products
                    </p>
                  )}
                </div>

                {/* Supplier Selection */}
                {selectedProduct && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select First Supplier</label>
                      <Select value={supplier1} onValueChange={setSupplier1}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose first supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliersWithSelectedProduct.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{supplier.business_name || supplier.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  ₹{getProductByName(supplier.id, selectedProduct)?.price || 'N/A'} • {supplier.city || 'N/A'}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Second Supplier</label>
                      <Select value={supplier2} onValueChange={setSupplier2}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose second supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliersWithSelectedProduct
                            .filter(s => s.id !== supplier1)
                            .map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{supplier.business_name || supplier.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    ₹{getProductByName(supplier.id, selectedProduct)?.price || 'N/A'} • {supplier.city || 'N/A'}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comparison Results */}
            {renderProductComparison()}

            {/* Initial State */}
            {!selectedProduct && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Product to Compare</h3>
                <p className="text-muted-foreground">
                  Choose a product from the dropdown above to start comparing prices between suppliers.
                </p>
              </div>
            )}
          </div>
        </>
      );
};

export default CompareSuppliers;