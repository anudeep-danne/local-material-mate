import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Calendar, Thermometer, Package } from 'lucide-react';

interface Shipment {
  id: string;
  orderId: string;
  retailerName: string;
  cropType: string;
  quantity: number;
  origin: string;
  destination: string;
  status: 'preparing' | 'in_transit' | 'delivered';
  departureDate: string;
  estimatedArrival: string;
  currentLocation?: string;
  temperature?: number;
  driverName: string;
  vehicleNumber: string;
}

const mockShipments: Shipment[] = [
  {
    id: 'SH001',
    orderId: 'ORD001',
    retailerName: 'Fresh Mart',
    cropType: 'Tomatoes',
    quantity: 200,
    origin: 'Nashik, Maharashtra',
    destination: 'Mumbai, Maharashtra',
    status: 'in_transit',
    departureDate: '2024-01-16',
    estimatedArrival: '2024-01-17',
    currentLocation: 'Highway NH-60, near Kalyan',
    temperature: 4,
    driverName: 'Suresh Patil',
    vehicleNumber: 'MH12AB1234'
  },
  {
    id: 'SH002',
    orderId: 'ORD002',
    retailerName: 'City Vegetables',
    cropType: 'Onions',
    quantity: 300,
    origin: 'Pune, Maharashtra',
    destination: 'Nagpur, Maharashtra',
    status: 'preparing',
    departureDate: '2024-01-17',
    estimatedArrival: '2024-01-18',
    driverName: 'Ravi Kumar',
    vehicleNumber: 'MH14CD5678'
  }
];

export default function DistributorShipments() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-500';
      case 'in_transit': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleTrackShipment = (shipmentId: string) => {
    console.log('Tracking shipment:', shipmentId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
        <p className="text-muted-foreground">Track ongoing deliveries to retailers</p>
      </div>

      <div className="grid gap-6">
        {mockShipments.map((shipment) => (
          <Card key={shipment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {shipment.cropType} to {shipment.retailerName}
                    <Badge className={getStatusColor(shipment.status)}>
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">Shipment ID: {shipment.id}</p>
                </div>
                <Button variant="outline" onClick={() => handleTrackShipment(shipment.id)}>
                  Track Shipment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Quantity</p>
                    <p className="text-lg font-bold">{shipment.quantity} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Departure</p>
                    <p className="text-lg font-bold">{shipment.departureDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Est. Arrival</p>
                    <p className="text-lg font-bold">{shipment.estimatedArrival}</p>
                  </div>
                </div>
                {shipment.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Temperature</p>
                      <p className="text-lg font-bold">{shipment.temperature}°C</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1 mb-1">
                    <MapPin className="w-4 h-4" />
                    Route
                  </p>
                  <p className="text-sm text-muted-foreground">
                    From: {shipment.origin}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    To: {shipment.destination}
                  </p>
                  {shipment.currentLocation && (
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      Current: {shipment.currentLocation}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Driver & Vehicle</p>
                  <p className="text-sm text-muted-foreground">
                    Driver: {shipment.driverName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vehicle: {shipment.vehicleNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}