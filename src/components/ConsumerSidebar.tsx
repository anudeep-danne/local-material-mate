import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home,
  Search,
  ShoppingCart,
  Package,
  Info,
  MessageCircle,
  LogOut,
  Users
} from 'lucide-react';

export function ConsumerSidebar() {
  const { logout } = useAuth();

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/consumer/home' },
    { icon: Search, label: 'Trace Produce', path: '/consumer/trace' },
    { icon: ShoppingCart, label: 'Buy Products Online', path: '/consumer/shop' },
    { icon: Package, label: 'My Orders', path: '/consumer/orders' },
    { icon: Info, label: 'About', path: '/consumer/about' },
    { icon: MessageCircle, label: 'Contact', path: '/consumer/contact' },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">RawMate Consumer</h1>
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