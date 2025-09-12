import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Calendar, MapPin, Truck } from 'lucide-react';

interface Purchase {
  id: string;
  batchId: string;
  farmerName: string;
  cropType: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  purchaseDate: string;
  status: 'in_storage' | 'in_transit' | 'partially_sold' | 'fully_sold';
  location: string;
}

const mockPurchases: Purchase[] = [
  {
    id: 'P001',
    batchId: 'BATCH001',
    farmerName: 'Rajesh Kumar',
    cropType: 'Tomatoes',
    quantity: 500,
    pricePerKg: 45,
    totalAmount: 22500,
    purchaseDate: '2024-01-15',
    status: 'in_storage',
    location: 'Nashik, Maharashtra'
  },
  {
    id: 'P002',
    batchId: 'BATCH003',
    farmerName: 'Amit Patel',
    cropType: 'Onions',
    quantity: 800,
    pricePerKg: 30,
    totalAmount: 24000,
    purchaseDate: '2024-01-14',
    status: 'partially_sold',
    location: 'Pune, Maharashtra'
  }
];

export default function DistributorPurchases() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_storage': return 'bg-blue-500';
      case 'in_transit': return 'bg-yellow-500';
      case 'partially_sold': return 'bg-orange-500';
      case 'fully_sold': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSellToRetailer = (purchaseId: string) => {
    console.log('Selling to retailer:', purchaseId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Purchases</h1>
        <p className="text-muted-foreground">Manage your purchased batches and inventory</p>
      </div>

      <div className="grid gap-6">
        {mockPurchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {purchase.cropType}
                    <Badge className={getStatusColor(purchase.status)}>
                      {purchase.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">from {purchase.farmerName}</p>
                </div>
                <p className="text-sm text-muted-foreground">Purchase ID: {purchase.id}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Quantity</p>
                    <p className="text-lg font-bold">{purchase.quantity} kg</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Price/kg</p>
                  <p className="text-lg font-bold">₹{purchase.pricePerKg}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-lg font-bold text-green-600">₹{purchase.totalAmount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Purchase Date</p>
                    <p className="text-lg font-bold">{purchase.purchaseDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-lg font-bold">{purchase.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Batch ID: {purchase.batchId}
                </p>
                
                {(purchase.status === 'in_storage' || purchase.status === 'partially_sold') && (
                  <Button 
                    onClick={() => handleSellToRetailer(purchase.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Sell to Retailer
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