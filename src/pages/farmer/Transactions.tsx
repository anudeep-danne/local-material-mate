import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sale';
  batchId: string;
  buyer: string;
  cropType: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  status: 'completed' | 'pending' | 'processing';
  date: string;
  transactionId: string;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'sale',
    batchId: 'BATCH001',
    buyer: 'Green Valley Distributors',
    cropType: 'Tomatoes',
    quantity: 500,
    pricePerKg: 45,
    totalAmount: 22500,
    status: 'completed',
    date: '2024-01-15',
    transactionId: 'TXN001234'
  },
  {
    id: '2',
    type: 'sale',
    batchId: 'BATCH002',
    buyer: 'Fresh Market Co.',
    cropType: 'Potatoes',
    quantity: 300,
    pricePerKg: 25,
    totalAmount: 7500,
    status: 'processing',
    date: '2024-01-14',
    transactionId: 'TXN001235'
  }
];

export default function FarmerTransactions() {
  const totalEarnings = mockTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">Track all your sales and earnings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed sales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="grid gap-4">
        {mockTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Sale to {transaction.buyer}
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">Transaction ID: {transaction.transactionId}</p>
                </div>
                <p className="text-sm text-muted-foreground">{transaction.date}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Batch ID</p>
                  <p className="font-semibold">{transaction.batchId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Crop</p>
                  <p className="font-semibold">{transaction.cropType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                  <p className="font-semibold">{transaction.quantity} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price/kg</p>
                  <p className="font-semibold">₹{transaction.pricePerKg}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-green-600">₹{transaction.totalAmount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}