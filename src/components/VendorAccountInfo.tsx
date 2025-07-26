import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVendorAccount, VendorAccountData } from '@/hooks/useVendorAccount';
import { useAuth } from '@/hooks/useAuth';
import { User, Save, Loader2 } from 'lucide-react';

export function VendorAccountInfo() {
  const { user } = useAuth();
  const { accountData, loading, saving, error, updateAccountData } = useVendorAccount();
  
  const [formData, setFormData] = useState<Partial<VendorAccountData>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data when account data loads
  useEffect(() => {
    if (accountData) {
      setFormData({
        name: accountData.name || '',
        business_name: accountData.business_name || '',
        phone: accountData.phone || '',
        address: accountData.address || '',
        city: accountData.city || '',
        pincode: accountData.pincode || '',
      });
    }
  }, [accountData]);

  const handleInputChange = (field: keyof VendorAccountData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    console.log('🔍 Saving form data:', formData);
    const success = await updateAccountData(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (accountData) {
      setFormData({
        name: accountData.name || '',
        business_name: accountData.business_name || '',
        phone: accountData.phone || '',
        address: accountData.address || '',
        city: accountData.city || '',
        pincode: accountData.pincode || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading account information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-destructive mb-2">Error loading account information</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name || ''}
              onChange={(e) => handleInputChange('business_name', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your business name"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
              placeholder="Your email address"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your city"
            />
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={formData.pincode || ''}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your pincode"
              type="number"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter your complete address"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-vendor-primary hover:bg-vendor-primary/90"
            >
              Edit Information
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-vendor-primary hover:bg-vendor-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        {/* Last Updated Info */}
        {accountData?.updated_at ? (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Last updated: {new Date(accountData.updated_at).toLocaleString()}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Last updated: Unknown
          </div>
        )}
      </CardContent>
    </Card>
  );
} 