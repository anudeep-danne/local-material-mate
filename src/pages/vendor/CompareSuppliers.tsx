import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Clock, MapPin } from "lucide-react";
import { useState } from "react";

// Sample suppliers data
const suppliers = [
  {
    id: 1,
    name: "Kumar Vegetables",
    rating: 4.2,
    productsCount: 45,
    averagePrice: 42,
    deliveryTime: "2-3 days",
    location: "Sector 15, Delhi",
    specialties: ["Vegetables", "Fruits"],
    contact: "+91 98765 43210"
  },
  {
    id: 2,
    name: "Sharma Traders",
    rating: 4.8,
    productsCount: 38,
    averagePrice: 38,
    deliveryTime: "1-2 days",
    location: "Karol Bagh, Delhi",
    specialties: ["Vegetables", "Spices"],
    contact: "+91 98765 43211"
  },
  {
    id: 3,
    name: "Patel Oil Mills",
    rating: 4.1,
    productsCount: 12,
    averagePrice: 115,
    deliveryTime: "3-4 days",
    location: "Industrial Area, Delhi",
    specialties: ["Oils", "Ghee"],
    contact: "+91 98765 43212"
  },
  {
    id: 4,
    name: "Gupta Spices",
    rating: 4.9,
    productsCount: 28,
    averagePrice: 85,
    deliveryTime: "2-3 days",
    location: "Chandni Chowk, Delhi",
    specialties: ["Spices", "Masalas"],
    contact: "+91 98765 43213"
  }
];

const CompareSuppliers = () => {
  const [supplier1, setSupplier1] = useState<string>("");
  const [supplier2, setSupplier2] = useState<string>("");

  const selectedSupplier1 = suppliers.find(s => s.id.toString() === supplier1);
  const selectedSupplier2 = suppliers.find(s => s.id.toString() === supplier2);

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
            {/* Supplier Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-sm font-medium mb-2 block">Select First Supplier</label>
                <Select value={supplier1} onValueChange={setSupplier1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
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
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
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
                      <div className="flex">{renderStars(selectedSupplier1.rating)}</div>
                      <span className="text-sm font-semibold">{selectedSupplier1.rating}</span>
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
                        <span className="font-semibold">₹{selectedSupplier1.averagePrice}/kg</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Delivery Time</span>
                        </div>
                        <span className="font-semibold">{selectedSupplier1.deliveryTime}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Location</span>
                        </div>
                        <span className="font-semibold text-xs">{selectedSupplier1.location}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier1.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Contact</h4>
                      <p className="text-sm text-muted-foreground">{selectedSupplier1.contact}</p>
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
                      <div className="flex">{renderStars(selectedSupplier2.rating)}</div>
                      <span className="text-sm font-semibold">{selectedSupplier2.rating}</span>
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
                        <span className="font-semibold">₹{selectedSupplier2.averagePrice}/kg</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Delivery Time</span>
                        </div>
                        <span className="font-semibold">{selectedSupplier2.deliveryTime}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Location</span>
                        </div>
                        <span className="font-semibold text-xs">{selectedSupplier2.location}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier2.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Contact</h4>
                      <p className="text-sm text-muted-foreground">{selectedSupplier2.contact}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  Select two suppliers to compare their offerings, ratings, and delivery options.
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CompareSuppliers;