import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Save, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const supplierId = user?.id;
  const { addProduct, loading } = useSupplierProducts(supplierId || "");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    unit: "",
    quantity: "",
    description: "",
    image: null as File | null
  });
  const [saving, setSaving] = useState(false);

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
    if (saving) return;
    setSaving(true);
    try {
      // Check if user is logged in
      if (!user) {
        toast.error("You must be logged in to add products.");
        setSaving(false);
        return;
      }
      // Convert price and quantity to numbers
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.quantity, 10);
      if (!formData.name || !formData.category || isNaN(price) || isNaN(stock) || !formData.unit) {
        toast.error("Please fill all required fields.");
        setSaving(false);
        return;
      }
      let imageUrl: string | undefined = undefined;
      if (formData.image) {
        // Upload image to Supabase Storage
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('product-images').upload(fileName, formData.image);
        if (error) {
          toast.error('Image upload failed: ' + error.message);
          console.error('Image upload failed:', error);
          setSaving(false);
          return;
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        if (!publicUrlData?.publicUrl) {
          toast.error('Failed to get public image URL.');
          console.error('Get public URL failed:', publicUrlData);
          setSaving(false);
          return;
        }
        imageUrl = publicUrlData.publicUrl;
      }
      // Call addProduct from hook
      const success = await addProduct({
        name: formData.name,
        price,
        stock,
        category: formData.category,
        image_url: imageUrl
      });
      if (success) {
        toast.success('Product added successfully!');
        navigate('/supplier/products');
      } else {
        toast.error('Failed to add product.');
      }
    } catch (err) {
      toast.error('Unexpected error occurred.');
      console.error('Add product error:', err);
    } finally {
      setSaving(false);
    }
  };



  return (
    <>
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
          Back to Products
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
                            <SelectItem value="vegetables">Vegetables</SelectItem>
                            <SelectItem value="grains">Grains</SelectItem>
                            <SelectItem value="pulses">Pulses</SelectItem>
                            <SelectItem value="spices">Spices</SelectItem>
                            <SelectItem value="oils">Oils</SelectItem>
                            <SelectItem value="dairy">Dairy</SelectItem>
                            <SelectItem value="others">Others</SelectItem>
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
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="supplier" 
                        className="flex-1"
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="flex items-center"><Save className="mr-2 h-4 w-4 animate-spin" />Saving...</span>
                        ) : (
                          <span className="flex items-center"><Save className="mr-2 h-4 w-4" />Save Product</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      );
};

export default AddProduct;