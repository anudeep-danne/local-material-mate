import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const EditProduct = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { productId } = useParams<{ productId: string }>();
  const [loading, setLoading] = useState(false);
  
  const supplierId = user?.id;
  const { products, updateProduct } = useSupplierProducts(supplierId || "");
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: null as File | null,
    image_url: ""
  });

  // Find the product to edit
  const product = products.find(p => p.id === productId);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        image: null,
        image_url: product.image_url || ""
      });
    }
  }, [product]);

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
    
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl = formData.image_url;
      if (formData.image) {
        // Upload image to Supabase Storage
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('product-images').upload(fileName, formData.image, { upsert: true });
        if (error) {
          toast.error('Image upload failed: ' + error.message);
          console.error('Image upload failed:', error);
          setLoading(false);
          return;
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        if (!publicUrlData?.publicUrl) {
          toast.error('Failed to get public image URL.');
          console.error('Get public URL failed:', publicUrlData);
          setLoading(false);
          return;
        }
        imageUrl = publicUrlData.publicUrl;
      }
      const updateData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        image_url: imageUrl || null
      };

      const success = await updateProduct(productId, updateData);
      if (success) {
        toast.success('Product updated successfully!');
        navigate('/supplier/products');
      } else {
        toast.error('Failed to update product.');
      }
    } catch (err) {
      toast.error('Unexpected error occurred.');
      console.error('Update product error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Edit Product</h1>
        </header>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Edit Product</h1>
        </header>
        <div className="p-4 md:p-6">
          <div className="text-center py-8">
            <div className="text-lg text-destructive mb-4">Product not found</div>
            <Button onClick={() => navigate('/supplier/products')}>Back to Products</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="mr-4" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/supplier/products')}
          className="mr-2 md:mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isMobile ? "Back" : "Back to Products"}
        </Button>
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Edit Product</h1>
      </header>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl text-supplier-primary">Edit Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm md:text-base">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Fresh Red Onions"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="h-10 md:h-10"
                  />
                </div>

                {/* Category and Price */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm md:text-base">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger className="h-10 md:h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="grains">Grains</SelectItem>
                        <SelectItem value="pulses">Pulses</SelectItem>
                        <SelectItem value="spices">Spices</SelectItem>
                        <SelectItem value="oils">Oils</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm md:text-base">Price per Unit (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      required
                      className="h-10 md:h-10"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm md:text-base">Available Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    required
                    className="h-10 md:h-10"
                  />
                </div>

                {/* Current Image */}
                {formData.image_url && (
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">Current Image</Label>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={formData.image_url} 
                        alt="Current product" 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="text-xs md:text-sm text-muted-foreground">
                        Current product image
                      </span>
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm md:text-base">Update Product Image</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 md:p-6 text-center hover:border-supplier-primary/50 transition-colors">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <Upload className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Click to upload new image
                      </p>
                      {formData.image && (
                        <p className="text-xs md:text-sm text-supplier-primary mt-2 truncate">
                          {formData.image.name}
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-10 md:h-10"
                    onClick={() => navigate('/supplier/products')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="supplier" 
                    className="flex-1 h-10 md:h-10"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center"><Save className="mr-2 h-4 w-4 animate-spin" />Updating...</span>
                    ) : (
                      <span className="flex items-center"><Save className="mr-2 h-4 w-4" />Update Product</span>
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

export default EditProduct; 