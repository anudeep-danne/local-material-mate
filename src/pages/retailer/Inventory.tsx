import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RetailerInventory() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">My Inventory</h1>
      <p className="text-muted-foreground mb-8">Manage stock and generate QR codes</p>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No inventory items</p>
        </CardContent>
      </Card>
    </div>
  );
}