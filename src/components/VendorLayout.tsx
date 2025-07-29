import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { VendorSidebar } from '@/components/VendorSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface VendorLayoutProps {
  children: React.ReactNode;
}

export const VendorLayout = ({ children }: VendorLayoutProps) => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, error } = useAuth();

  useEffect(() => {
    console.log('🔍 VendorLayout: Auth state:', { 
      user: !!user, 
      role, 
      loading: authLoading, 
      error 
    });
  }, [user, role, authLoading, error]);

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-lg mb-2">Loading...</div>
                <div className="text-sm text-muted-foreground">Checking authentication...</div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Show error if authentication failed
  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <VendorSidebar />
          <main className="flex-1 bg-background">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-lg mb-2 text-destructive">Authentication Error</div>
                <div className="text-sm text-muted-foreground mb-4">{error}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Redirect if not logged in
  if (!user) {
    console.log('🚫 VendorLayout: No user, redirecting to vendor login');
    navigate('/vendor-login');
    return null;
  }

  // Redirect if not a vendor
  if (role !== 'vendor') {
    console.log('🚫 VendorLayout: Not a vendor, redirecting to home');
    navigate('/');
    return null;
  }

  // Render the vendor layout with content
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <VendorSidebar />
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}; 