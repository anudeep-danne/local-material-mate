import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Save, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useSupplierId } from "@/hooks/useSupplierId";

const AddProduct = () => {
  const navigate = useNavigate();
  const { supplierId, loading: supplierLoading, error: supplierError } = useSupplierId();
  const { addProduct, loading: addLoading } = useSupplierProducts(supplierId || "");
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    unit: "",
    quantity: "",
    description: "",
    image: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert price and quantity to numbers
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.quantity, 10);
    if (!formData.name || !formData.category || isNaN(price) || isNaN(stock) || !formData.unit) {
      alert("Please fill all required fields.");
      return;
    }
    // Call addProduct from hook
    const success = await addProduct({
      name: formData.name,
      price,
      stock,
      category: formData.category,
      image_url: undefined // Not handling image upload yet
    });
    if (success) {
      navigate('/supplier/products');
    }
  };

  // Show loading state while supplier ID is being fetched
  if (supplierLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SupplierSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Add New Product</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-lg">Loading...</div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Show error state if supplier ID fetch failed
  if (supplierError) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SupplierSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Add New Product</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-lg text-destructive mb-4">Error loading supplier information</div>
                <div className="text-sm text-muted-foreground mb-4">{supplierError}</div>
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
        <SupplierSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/supplier/products')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">Add New Product</h1>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-supplier-primary">Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Fresh Red Onions"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>

                    {/* Category and Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vegetables">Vegetables</SelectItem>
                            <SelectItem value="Grains">Grains</SelectItem>
                            <SelectItem value="Spices">Spices</SelectItem>
                            <SelectItem value="Oils">Oils</SelectItem>
                            <SelectItem value="Dairy">Dairy</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit *</Label>
                        <Select 
                          value={formData.unit} 
                          onValueChange={(value) => handleInputChange("unit", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="g">Gram (g)</SelectItem>
                            <SelectItem value="l">Liter (L)</SelectItem>
                            <SelectItem value="ml">Milliliter (ml)</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                            <SelectItem value="dozen">Dozen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price per Unit (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Available Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="0"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange("quantity", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your product quality, origin, or any special features..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="image">Product Image</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-supplier-primary/50 transition-colors">
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label htmlFor="image" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload product image
                          </p>
                          {formData.image && (
                            <p className="text-sm text-supplier-primary mt-2">
                              {formData.image.name}
                            </p>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate('/supplier/products')}
                        disabled={addLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="supplier" 
                        className="flex-1"
                        disabled={addLoading}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {addLoading ? 'Saving...' : 'Save Product'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AddProduct;