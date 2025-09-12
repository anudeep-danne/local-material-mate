import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSupplyChain } from '@/hooks/useSupplyChain';

export default function CreateBatch() {
  const navigate = useNavigate();
  const { createBatch, loading } = useSupplyChain();
  const [formData, setFormData] = useState({
    crop: '',
    total_quantity_kg: '',
    price_per_kg: '',
    harvest_date: '',
    location: '',
    metadata: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const batchData = {
        crop: formData.crop,
        total_quantity_kg: parseFloat(formData.total_quantity_kg),
        price_per_kg: parseFloat(formData.price_per_kg),
        harvest_date: formData.harvest_date,
        location: formData.location,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : {}
      };

      await createBatch(batchData);
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Batch</CardTitle>
          <CardDescription>
            Add a new harvest batch to the supply chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="crop">Crop Type</Label>
              <Input
                id="crop"
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                placeholder="e.g., Tomatoes, Wheat, Rice"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_quantity_kg">Total Quantity (kg)</Label>
                <Input
                  id="total_quantity_kg"
                  name="total_quantity_kg"
                  type="number"
                  step="0.01"
                  value={formData.total_quantity_kg}
                  onChange={handleInputChange}
                  placeholder="1000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price_per_kg">Price per kg</Label>
                <Input
                  id="price_per_kg"
                  name="price_per_kg"
                  type="number"
                  step="0.01"
                  value={formData.price_per_kg}
                  onChange={handleInputChange}
                  placeholder="10.50"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="harvest_date">Harvest Date</Label>
              <Input
                id="harvest_date"
                name="harvest_date"
                type="date"
                value={formData.harvest_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Farm location or region"
                required
              />
            </div>

            <div>
              <Label htmlFor="metadata">Additional Information (JSON)</Label>
              <Textarea
                id="metadata"
                name="metadata"
                value={formData.metadata}
                onChange={handleInputChange}
                placeholder='{"certification": "organic", "storage_conditions": "cold"}'
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Batch'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/farmer/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}