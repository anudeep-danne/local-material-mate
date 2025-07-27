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

const EditProduct = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
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
        toast.success("Product updated successfully");
        navigate('/supplier/products');
      } else {
        toast.error("Failed to update product");
      }
    } catch (err) {
      toast.error("An error occurred while updating the product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SupplierSidebar />
          <main className="flex-1 bg-background">
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
              <h1 className="text-2xl font-semibold text-foreground">Edit Product</h1>
            </header>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-lg text-destructive mb-4">Product not found</div>
                <Button onClick={() => navigate('/supplier/products')}>Back to Products</Button>
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
            <h1 className="text-2xl font-semibold text-foreground">Edit Product</h1>
          </header>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-supplier-primary">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Product name cannot be changed</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleInputChange("stock", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Category cannot be changed</p>
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
                          Click to upload new product image
                        </p>
                        {formData.image && (
                          <p className="text-sm text-supplier-primary mt-2">
                            {formData.image.name}
                          </p>
                        )}
                        {formData.image_url && !formData.image && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Current image: {formData.image_url}
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Current Image URL (for reference) */}
                  {formData.image_url && (
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Current Image URL</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => handleInputChange("image_url", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">You can also update the image URL directly</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      variant="supplier" 
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Product
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/supplier/products')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EditProduct; 