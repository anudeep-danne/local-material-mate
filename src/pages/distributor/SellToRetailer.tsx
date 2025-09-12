import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface RetailerOffer {
  purchaseId: string;
  cropType: string;
  quantity: number;
  pricePerKg: number;
  retailerName: string;
  notes: string;
}

const availableInventory = [
  { id: 'P001', cropType: 'Tomatoes', quantity: 500, pricePerKg: 45 },
  { id: 'P002', cropType: 'Onions', quantity: 800, pricePerKg: 30 },
  { id: 'P003', cropType: 'Potatoes', quantity: 300, pricePerKg: 25 }
];

export default function SellToRetailer() {
  const [offer, setOffer] = useState<Partial<RetailerOffer>>({
    quantity: 0,
    pricePerKg: 0,
    retailerName: '',
    notes: ''
  });

  const [selectedPurchase, setSelectedPurchase] = useState<string>('');

  const handleSubmitOffer = () => {
    console.log('Submitting offer:', offer);
    // Implementation for submitting offer to retailer
  };

  const selectedInventory = availableInventory.find(item => item.id === selectedPurchase);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sell to Retailer</h1>
        <p className="text-muted-foreground">Create offers for retailers from your inventory</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Available Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableInventory.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPurchase === item.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPurchase(item.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{item.cropType}</h3>
                      <p className="text-sm text-muted-foreground">Purchase ID: {item.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.quantity} kg</p>
                      <p className="text-sm text-muted-foreground">₹{item.pricePerKg}/kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Offer */}
        <Card>
          <CardHeader>
            <CardTitle>Create Retailer Offer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedInventory && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">Selected: {selectedInventory.cropType}</h3>
                <p className="text-sm text-muted-foreground">
                  Available: {selectedInventory.quantity} kg at ₹{selectedInventory.pricePerKg}/kg
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="retailerName">Retailer Name</Label>
              <Input
                id="retailerName"
                placeholder="Enter retailer name"
                value={offer.retailerName}
                onChange={(e) => setOffer({...offer, retailerName: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity (kg)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={offer.quantity}
                onChange={(e) => setOffer({...offer, quantity: Number(e.target.value)})}
                max={selectedInventory?.quantity || 0}
              />
            </div>

            <div>
              <Label htmlFor="pricePerKg">Selling Price per kg (₹)</Label>
              <Input
                id="pricePerKg"
                type="number"
                placeholder="Enter selling price"
                value={offer.pricePerKg}
                onChange={(e) => setOffer({...offer, pricePerKg: Number(e.target.value)})}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for the retailer"
                value={offer.notes}
                onChange={(e) => setOffer({...offer, notes: e.target.value})}
              />
            </div>

            {offer.quantity && offer.pricePerKg && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-800">
                  Total Offer Value: ₹{(offer.quantity * offer.pricePerKg).toLocaleString()}
                </p>
              </div>
            )}

            <Button 
              onClick={handleSubmitOffer}
              className="w-full"
              disabled={!selectedPurchase || !offer.quantity || !offer.pricePerKg || !offer.retailerName}
            >
              Send Offer to Retailer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}