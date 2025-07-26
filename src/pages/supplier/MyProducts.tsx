import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Search, Package } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Sample products data
const products = [
  {
    id: 1,
    name: "Premium Basmati Rice",
    category: "Grains",
    price: 80,
    unit: "kg",
    stock: 150,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150"
  },
  {
    id: 2,
    name: "Fresh Red Onions",
    category: "Vegetables",
    price: 35,
    unit: "kg",
    stock: 25,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150"
  },
  {
    id: 3,
    name: "Sunflower Oil",
    category: "Oils",
    price: 120,
    unit: "L",
    stock: 80,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150"
  },
  {
    id: 4,
    name: "Turmeric Powder",
    category: "Spices",
    price: 180,
    unit: "kg",
    stock: 0,
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1615485291219-8c8da86f5f5b?w=150"
  }
];

const MyProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-success text-white";
      case "Low Stock":
        return "bg-warning text-white";
      case "Out of Stock":
        return "bg-destructive text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SupplierSidebar />
        
        <main className="flex-1 bg-background">
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
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Spices">Spices</SelectItem>
                  <SelectItem value="Oils">Oils</SelectItem>
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
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <img
                        src={product.image}
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
                              ₹{product.price}/{product.unit}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <Badge className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Stock: {product.stock} {product.unit}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="supplier-outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            )}

            {products.length === 0 && (
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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MyProducts;