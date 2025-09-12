import { useAuth } from '@/hooks/useAuth';
import { useBatches } from '@/hooks/useBatches';
import { useOffers } from '@/hooks/useOffers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, HandHeart, TrendingUp, Wheat } from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { batches, loading: batchesLoading } = useBatches(user?.id || null, 'farmer');
  const { offers, loading: offersLoading } = useOffers(user?.id || null, 'farmer');

  const pendingOffers = offers.filter(offer => offer.status === 'Pending');
  const availableBatches = batches.filter(batch => batch.status === 'Available');
  const totalRevenue = batches
    .filter(batch => batch.status === 'Fully Sold')
    .reduce((sum, batch) => sum + (batch.quantity * batch.price_per_kg), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Partially Sold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Fully Sold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your farm operations.</p>
        </div>
        <Wheat className="h-12 w-12 text-primary" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableBatches.length}</div>
            <p className="text-xs text-muted-foreground">Ready for distribution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
            <HandHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOffers.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Batches</CardTitle>
          <CardDescription>Your latest crop batches and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {batchesLoading ? (
            <div className="text-center py-4">Loading batches...</div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No batches created yet. Create your first batch to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {batches.slice(0, 5).map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{batch.crop_type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {batch.quantity} kg • ₹{batch.price_per_kg}/kg • Harvested: {new Date(batch.harvest_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(batch.status)}>
                      {batch.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {batch.remaining_quantity} kg left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Offers</CardTitle>
          <CardDescription>Latest offers from distributors</CardDescription>
        </CardHeader>
        <CardContent>
          {offersLoading ? (
            <div className="text-center py-4">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No offers received yet. Your batches will start receiving offers from distributors.
            </div>
          ) : (
            <div className="space-y-4">
              {offers.slice(0, 5).map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{offer.batch.crop_type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {offer.quantity} kg • ₹{offer.offered_price_per_kg}/kg
                    </p>
                    <p className="text-sm text-muted-foreground">
                      From: {offer.distributor.business_name || offer.distributor.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={offer.status === 'Pending' ? 'default' : 
                                   offer.status === 'Accepted' ? 'default' : 'secondary'}>
                      {offer.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      ₹{offer.total_offer_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}