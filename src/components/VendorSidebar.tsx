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
  Store, 
  ShoppingCart, 
  Package, 
  Scale, 
  Star, 
  Home,
  Utensils 
} from "lucide-react";

const vendorItems = [
  { title: "Dashboard", url: "/vendor/dashboard", icon: Home },
  { title: "Browse Products", url: "/vendor/browse", icon: Store },
  { title: "My Cart", url: "/vendor/cart", icon: ShoppingCart },
  { title: "My Orders", url: "/vendor/orders", icon: Package },
  { title: "Compare Suppliers", url: "/vendor/compare", icon: Scale },
  { title: "Reviews", url: "/vendor/reviews", icon: Star },
];

export function VendorSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-vendor-secondary text-vendor-primary font-medium" : "hover:bg-vendor-secondary/50";

  return (
    <Sidebar className="w-60">
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-vendor-primary/20">
          <NavLink to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <Utensils className="h-6 w-6 text-vendor-primary" />
            <div>
              <h2 className="font-semibold text-vendor-primary">RawMate</h2>
              <p className="text-xs text-muted-foreground">Vendor Panel</p>
            </div>
          </NavLink>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Vendor Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {vendorItems.map((item) => {
                const active = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end className="flex items-center w-full">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}