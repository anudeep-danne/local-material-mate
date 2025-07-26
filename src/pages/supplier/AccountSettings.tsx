import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Building, MapPin, Phone, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useSupplierAccount } from "@/hooks/useSupplierAccount";

const AccountSettings = () => {
  // Using supplier ID for demo - in real app this would come from auth
  const supplierId = "22222222-2222-2222-2222-222222222222";
  const { account, loading, updateAccount } = useSupplierAccount(supplierId);
  
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    bankAccount: "",
    ifscCode: "",
    description: ""
  });

  useEffect(() => {
    if (account) {
      setFormData({
        businessName: account.business_name || "",
        ownerName: account.name || "",
        email: account.email || "",
        phone: account.phone || "",
        address: account.address || "",
        city: account.city || "",
        state: account.state || "",
        pincode: account.pincode || "",
        gstNumber: "",
        bankAccount: "",
        ifscCode: "",
        description: account.description || ""
      });
    }
  }, [account]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAccount({
      business_name: formData.businessName,
      name: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      description: formData.description
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SupplierSidebar />
        
        <main className="flex-1 bg-background">
          {/* Header */}
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-semibold text-foreground">Account Settings</h1>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-supplier-primary flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange("businessName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">Owner Name *</Label>
                        <Input
                          id="ownerName"
                          value={formData.ownerName}
                          onChange={(e) => handleInputChange("ownerName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Describe your business, specialties, and experience..."
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-supplier-primary flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-supplier-primary flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Textarea
                        id="address"
                        rows={2}
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <Input
                          id="pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange("pincode", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-supplier-primary">Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={formData.gstNumber}
                        onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                        placeholder="15 digit GST number"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Bank Account Number</Label>
                        <Input
                          id="bankAccount"
                          value={formData.bankAccount}
                          onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                          placeholder="For payment processing"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          value={formData.ifscCode}
                          onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                          placeholder="Bank IFSC code"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit}
                  variant="supplier" 
                  size="lg"
                  className="px-8"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AccountSettings;