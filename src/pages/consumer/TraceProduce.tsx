import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TraceProduce() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Trace Produce</h1>
      <p className="text-muted-foreground mb-8">Track your food from farm to table</p>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Tracing feature coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}