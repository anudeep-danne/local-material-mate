export default function RetailerDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Retailer Dashboard</h1>
        <p className="text-muted-foreground">Manage your retail operations</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium">Inventory Items</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium">Daily Sales</h3>
          <p className="text-2xl font-bold">₹0</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium">Customer Orders</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium">Low Stock Items</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}