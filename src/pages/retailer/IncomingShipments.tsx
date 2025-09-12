import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IncomingShipments() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Incoming Shipments</h1>
      <p className="text-muted-foreground mb-8">Track deliveries from distributors</p>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No shipments incoming</p>
        </CardContent>
      </Card>
    </div>
  );
}