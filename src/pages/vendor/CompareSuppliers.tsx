import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Clock, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
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

  const selectedSupplier1 = suppliers.find(s => s.id === supplier1);
  const selectedSupplier2 = suppliers.find(s => s.id === supplier2);

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

            {/* Comparison */}
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