import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplierSidebar } from "@/components/SupplierSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Building, MapPin, Phone, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useSupplierProfile } from "@/hooks/useSupplierProfile";

const AccountSettings = () => {
  const { profile, updateProfile, loading, error } = useSupplierProfile();
  
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

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      console.log('Profile loaded:', profile);
      setFormData({
        businessName: profile.business_name || "",
        ownerName: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        gstNumber: "",
        bankAccount: "",
        ifscCode: "",
        description: profile.description || ""
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Form submit triggered!');
    
    // Check form validity
    const form = e.target as HTMLFormElement;
    console.log('Form validity:', form.checkValidity());
    console.log('Form elements:', form.elements);
    
    // Log any validation errors
    for (let i = 0; i < form.elements.length; i++) {
      const element = form.elements[i] as HTMLInputElement;
      if (element.validity && !element.validity.valid) {
        console.log('Validation error on:', element.name || element.id, element.validity);
      }
    }
    
    setIsSaving(true);
    
    console.log('Submitting form data:', formData);
    
    try {
      const updateData = {
        business_name: formData.businessName,
        name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        description: formData.description
      };
      
      console.log('Update data being sent:', updateData);
      
      const success = await updateProfile(updateData);
      
      if (success) {
        console.log('Profile updated successfully');
        // Form data will be updated automatically via the hook
      } else {
        console.log('Profile update failed');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleButtonClick = () => {
    console.log('🎯 Button clicked!');
    console.log('Current form data:', formData);
    console.log('Loading state:', loading);
    console.log('Is saving state:', isSaving);
    
    // Manually trigger form submission
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    } else {
      console.error('Form not found!');
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SupplierSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Account Settings</h1>
            </header>
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-8">
                  <div className="text-lg">Loading profile...</div>
                </div>
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
          <SupplierSidebar />
          <main className="flex-1 bg-background">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-semibold text-foreground">Account Settings</h1>
            </header>
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-8">
                  <div className="text-lg text-destructive mb-4">Error loading profile</div>
                  <div className="text-sm text-muted-foreground mb-4">{error}</div>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
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
            <h1 className="text-2xl font-semibold text-foreground">Account Settings</h1>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <form onSubmit={handleSubmit}>
                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-supplier-primary flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessName">Business Name *</Label>
                                                  <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange("businessName", e.target.value)}
                        />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerName">Owner Name *</Label>
                                                  <Input
                          id="ownerName"
                          value={formData.ownerName}
                          onChange={(e) => handleInputChange("ownerName", e.target.value)}
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
                    </div>
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
                        />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                                                  <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
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
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">PIN Code *</Label>
                          <Input
                            id="pincode"
                            value={formData.pincode}
                            onChange={(e) => handleInputChange("pincode", e.target.value)}
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
                <div className="flex justify-end gap-4">
                  <Button 
                    type="submit"
                    variant="supplier" 
                    size="lg"
                    className="px-8"
                    disabled={loading || isSaving}
                    onClick={handleButtonClick}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AccountSettings;