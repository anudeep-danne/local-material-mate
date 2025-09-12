import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RetailerBatches() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Available Batches</h1>
      <p className="text-muted-foreground mb-8">Browse distributor offers</p>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No batches available</p>
        </CardContent>
      </Card>
    </div>
  );
}