import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Batch } from '@/hooks/useSupplyChain';

export default function MyBatches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBatches();
    }
  }, [user]);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'Partial': return 'bg-yellow-500';
      case 'Sold': return 'bg-red-500';
      case 'Expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Batches</h1>
          <p className="text-muted-foreground">Manage your harvest batches</p>
        </div>
        <Link to="/farmer/create-batch">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Batch
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{batch.crop}</CardTitle>
                <Badge className={getStatusColor(batch.status)}>
                  {batch.status}
                </Badge>
              </div>
              <CardDescription>
                Harvested on {new Date(batch.harvest_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="font-medium">{batch.total_quantity_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available:</span>
                  <span className="font-medium">{batch.available_quantity_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-medium">₹{batch.price_per_kg}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="font-medium">{batch.location}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {batches.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No batches yet</h3>
            <p className="text-muted-foreground mb-4">Create your first harvest batch to get started</p>
            <Link to="/farmer/create-batch">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Batch
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}