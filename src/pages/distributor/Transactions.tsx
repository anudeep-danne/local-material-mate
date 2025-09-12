import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'purchase' | 'sale';
  counterparty: string;
  cropType: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  status: 'completed' | 'pending';
  date: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    type: 'purchase',
    counterparty: 'Rajesh Kumar (Farmer)',
    cropType: 'Tomatoes',
    quantity: 500,
    pricePerKg: 45,
    totalAmount: 22500,
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 'TXN002',
    type: 'sale',
    counterparty: 'Fresh Mart (Retailer)',
    cropType: 'Tomatoes',
    quantity: 200,
    pricePerKg: 60,
    totalAmount: 12000,
    status: 'completed',
    date: '2024-01-16'
  },
  {
    id: 'TXN003',
    type: 'purchase',
    counterparty: 'Amit Patel (Farmer)',
    cropType: 'Onions',
    quantity: 800,
    pricePerKg: 30,
    totalAmount: 24000,
    status: 'pending',
    date: '2024-01-17'
  }
];

export default function DistributorTransactions() {
  const totalPurchases = mockTransactions
    .filter(t => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalSales = mockTransactions
    .filter(t => t.type === 'sale' && t.status === 'completed')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const profit = totalSales - totalPurchases;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'purchase' ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">Track all your purchases and sales</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From farmers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">To retailers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Total count</p>
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
                    <span className={getTypeColor(transaction.type)}>
                      {transaction.type === 'purchase' ? '↓' : '↑'} {transaction.type.toUpperCase()}
                    </span>
                    - {transaction.cropType}
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">{transaction.counterparty}</p>
                </div>
                <p className="text-sm text-muted-foreground">{transaction.date}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="font-semibold">{transaction.id}</p>
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
                  <p className={`font-semibold ${getTypeColor(transaction.type)}`}>
                    ₹{transaction.totalAmount.toLocaleString()}
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