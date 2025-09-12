import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Award, Truck } from 'lucide-react';

interface DistributorProfile {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  licenses: string[];
  fleetSize: number;
  storageCapacity: string;
  serviceAreas: string[];
  experience: string;
  bio: string;
}

const mockProfile: DistributorProfile = {
  name: 'Suresh Verma',
  email: 'suresh.verma@freshlogistics.com',
  phone: '+91 9876543210',
  businessName: 'Fresh Logistics Pvt Ltd',
  address: 'Plot 45, Industrial Area, Sector 18',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411018',
  gstNumber: '27ABCDE1234F1Z5',
  licenses: ['Transport License', 'Cold Storage License', 'Food Handler License'],
  fleetSize: 12,
  storageCapacity: '500 tons',
  serviceAreas: ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'],
  experience: '8 years',
  bio: 'Leading distributor specializing in fresh produce logistics with cold chain capabilities and extensive network across Maharashtra.'
};

export default function DistributorProfile() {
  const [profile, setProfile] = useState<DistributorProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Distributor Profile</h1>
        <p className="text-muted-foreground">Manage your business profile and credentials</p>
      </div>

      <div className="grid gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Business Information</CardTitle>
              <Button 
                variant={isEditing ? "default" : "outline"}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={profile.businessName}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={profile.gstNumber}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, gstNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="name">Owner Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={profile.experience}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, experience: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Business Description</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                disabled={!isEditing}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={profile.address}
                disabled={!isEditing}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.city}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={profile.state}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, state: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={profile.pincode}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, pincode: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Business Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fleetSize">Fleet Size</Label>
                <Input
                  id="fleetSize"
                  type="number"
                  value={profile.fleetSize}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, fleetSize: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="storageCapacity">Storage Capacity</Label>
                <Input
                  id="storageCapacity"
                  value={profile.storageCapacity}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, storageCapacity: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label>Service Areas</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.serviceAreas.map((area, index) => (
                  <Badge key={index} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Licenses & Certifications
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.licenses.map((license, index) => (
                  <Badge key={index} className="bg-green-600">
                    {license}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}