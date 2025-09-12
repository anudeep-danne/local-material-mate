import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Award } from 'lucide-react';

interface FarmerProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  farmSize: string;
  primaryCrops: string[];
  certifications: string[];
  experience: string;
  bio: string;
}

const mockProfile: FarmerProfile = {
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@email.com',
  phone: '+91 9876543210',
  address: 'Village Greenfield, Near River Bank',
  city: 'Nashik',
  state: 'Maharashtra',
  pincode: '422003',
  farmSize: '15 acres',
  primaryCrops: ['Tomatoes', 'Potatoes', 'Onions', 'Wheat'],
  certifications: ['Organic Certified', 'Fair Trade', 'Good Agricultural Practices'],
  experience: '12 years',
  bio: 'Experienced farmer specializing in organic vegetable cultivation with focus on sustainable farming practices.'
};

export default function FarmerProfile() {
  const [profile, setProfile] = useState<FarmerProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Farmer Profile</h1>
        <p className="text-muted-foreground">Manage your profile information and certifications</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Personal Information</CardTitle>
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
                <Label htmlFor="name">Full Name</Label>
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
              <Label htmlFor="bio">Bio</Label>
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

        {/* Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Farm Address</Label>
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

        {/* Farm Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Farm Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="farmSize">Farm Size</Label>
              <Input
                id="farmSize"
                value={profile.farmSize}
                disabled={!isEditing}
                onChange={(e) => setProfile({...profile, farmSize: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Primary Crops</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.primaryCrops.map((crop, index) => (
                  <Badge key={index} variant="secondary">
                    {crop}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certifications
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.certifications.map((cert, index) => (
                  <Badge key={index} className="bg-green-600">
                    {cert}
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