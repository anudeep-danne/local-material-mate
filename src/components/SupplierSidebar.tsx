import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Home,
  Package,
  Plus,
  Inbox,
  Star,
  Settings,
  Warehouse
} from "lucide-react";

const supplierItems = [
  { title: "Dashboard", url: "/supplier/dashboard", icon: Home },
  { title: "My Products", url: "/supplier/products", icon: Package },
  { title: "Add Product", url: "/supplier/add-product", icon: Plus },
  { title: "Incoming Orders", url: "/supplier/orders", icon: Inbox },
  { title: "Reviews", url: "/supplier/reviews", icon: Star },
  { title: "Account Settings", url: "/supplier/settings", icon: Settings },
];

export function SupplierSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-supplier-secondary text-supplier-primary font-medium" : "hover:bg-supplier-secondary/50";

  return (
    <Sidebar className="w-60">
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-supplier-primary/20">
          <div className="flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-supplier-primary" />
            <div>
              <h2 className="font-semibold text-supplier-primary">RawMate</h2>
              <p className="text-xs text-muted-foreground">Supplier Panel</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Supplier Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supplierItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}