import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard,
  Package,
  Truck,
  Warehouse,
  FileText,
  Receipt,
  User,
  LogOut,
  ShoppingBag
} from 'lucide-react';

export function RetailerSidebar() {
  const { logout } = useAuth();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/retailer/dashboard' },
    { icon: Package, label: 'Available Batches', path: '/retailer/batches' },
    { icon: Truck, label: 'Incoming Shipments', path: '/retailer/shipments' },
    { icon: Warehouse, label: 'My Inventory', path: '/retailer/inventory' },
    { icon: FileText, label: 'Generate Public Info', path: '/retailer/public-info' },
    { icon: Receipt, label: 'Transactions', path: '/retailer/transactions' },
    { icon: User, label: 'Profile', path: '/retailer/profile' },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">RawMate Retailer</h1>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
          
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full mt-4"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}