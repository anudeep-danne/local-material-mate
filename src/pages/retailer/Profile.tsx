import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RetailerProfile() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Retailer Profile</h1>
      <p className="text-muted-foreground mb-8">Manage shop details</p>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Profile management coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}