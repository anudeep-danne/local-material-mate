import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Offer {
  id: string;
  distributorName: string;
  batchId: string;
  cropType: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected';
  offerDate: string;
}

// Mock data
const mockOffers: Offer[] = [
  {
    id: '1',
    distributorName: 'Green Valley Distributors',
    batchId: 'BATCH001',
    cropType: 'Tomatoes',
    quantity: 500,
    pricePerKg: 45,
    totalAmount: 22500,
    status: 'pending',
    offerDate: '2024-01-15'
  },
  {
    id: '2',
    distributorName: 'Fresh Market Co.',
    batchId: 'BATCH002',
    cropType: 'Potatoes',
    quantity: 1000,
    pricePerKg: 25,
    totalAmount: 25000,
    status: 'accepted',
    offerDate: '2024-01-14'
  }
];

export default function FarmerOffers() {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);

  const handleAcceptOffer = (offerId: string) => {
    setOffers(offers.map(offer => 
      offer.id === offerId ? { ...offer, status: 'accepted' } : offer
    ));
  };

  const handleRejectOffer = (offerId: string) => {
    setOffers(offers.map(offer => 
      offer.id === offerId ? { ...offer, status: 'rejected' } : offer
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Offers from Distributors</h1>
        <p className="text-muted-foreground">Review and respond to purchase offers</p>
      </div>

      <div className="grid gap-6">
        {offers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No offers received yet</p>
            </CardContent>
          </Card>
        ) : (
          offers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {offer.distributorName}
                      <Badge className={getStatusColor(offer.status)}>
                        {offer.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-muted-foreground">Batch: {offer.batchId}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{offer.offerDate}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Crop</p>
                    <p className="text-2xl font-bold">{offer.cropType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Quantity</p>
                    <p className="text-2xl font-bold">{offer.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Price/kg</p>
                    <p className="text-2xl font-bold">₹{offer.pricePerKg}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">₹{offer.totalAmount}</p>
                  </div>
                </div>
                
                {offer.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Offer
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleRejectOffer(offer.id)}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Offer
                    </Button>
                  </div>
                )}
                
                {offer.status === 'accepted' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Offer Accepted</span>
                  </div>
                )}
                
                {offer.status === 'rejected' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Offer Rejected</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}