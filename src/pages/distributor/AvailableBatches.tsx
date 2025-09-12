import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Package } from 'lucide-react';

interface Batch {
  id: string;
  farmerId: string;
  farmerName: string;
  cropType: string;
  quantity: number;
  pricePerKg: number;
  harvestDate: string;
  location: string;
  status: 'available' | 'partially_sold' | 'sold_out';
}

const mockBatches: Batch[] = [
  {
    id: 'BATCH001',
    farmerId: 'F001',
    farmerName: 'Rajesh Kumar',
    cropType: 'Tomatoes',
    quantity: 1000,
    pricePerKg: 45,
    harvestDate: '2024-01-10',
    location: 'Nashik, Maharashtra',
    status: 'available'
  },
  {
    id: 'BATCH002',
    farmerId: 'F002',
    farmerName: 'Priya Sharma',
    cropType: 'Potatoes',
    quantity: 500,
    pricePerKg: 25,
    harvestDate: '2024-01-12',
    location: 'Pune, Maharashtra',
    status: 'partially_sold'
  }
];

export default function AvailableBatches() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'partially_sold': return 'bg-yellow-500';
      case 'sold_out': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleMakeOffer = (batchId: string) => {
    // Implementation for making an offer
    console.log('Making offer for batch:', batchId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Available Farmer Batches</h1>
        <p className="text-muted-foreground">Browse and purchase fresh produce directly from farmers</p>
      </div>

      <div className="grid gap-6">
        {mockBatches.map((batch) => (
          <Card key={batch.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {batch.cropType}
                    <Badge className={getStatusColor(batch.status)}>
                      {batch.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">by {batch.farmerName}</p>
                </div>
                <p className="text-sm text-muted-foreground">Batch ID: {batch.id}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Quantity</p>
                    <p className="text-lg font-bold">{batch.quantity} kg</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Price/kg</p>
                  <p className="text-lg font-bold">₹{batch.pricePerKg}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Harvest Date</p>
                    <p className="text-lg font-bold">{batch.harvestDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-lg font-bold">{batch.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-green-600">
                  Total Value: ₹{(batch.quantity * batch.pricePerKg).toLocaleString()}
                </p>
                
                {batch.status !== 'sold_out' && (
                  <Button 
                    onClick={() => handleMakeOffer(batch.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Make Offer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}