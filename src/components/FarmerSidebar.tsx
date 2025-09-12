import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard,
  Plus,
  Package,
  HandHeart,
  Receipt,
  User,
  LogOut,
  Wheat
} from 'lucide-react';

export function FarmerSidebar() {
  const { logout } = useAuth();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/farmer/dashboard' },
    { icon: Plus, label: 'Create Batch', path: '/farmer/create-batch' },
    { icon: Package, label: 'My Batches', path: '/farmer/batches' },
    { icon: HandHeart, label: 'Offers from Distributors', path: '/farmer/offers' },
    { icon: Receipt, label: 'Transactions', path: '/farmer/transactions' },
    { icon: User, label: 'Profile', path: '/farmer/profile' },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Wheat className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">RawMate Farmer</h1>
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