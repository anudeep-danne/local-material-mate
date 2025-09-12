import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BuyProducts() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Buy Products</h1>
      <p className="text-muted-foreground mb-8">Shop fresh produce from retailers</p>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Products coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}