import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RetailerTransactions() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Transactions</h1>
      <p className="text-muted-foreground mb-8">View purchase history</p>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No transactions yet</p>
        </CardContent>
      </Card>
    </div>
  );
}