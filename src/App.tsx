import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Welcome from '@/pages/Welcome';
import FarmerLogin from '@/pages/FarmerLogin';
import DistributorLogin from '@/pages/DistributorLogin';
import RetailerLogin from '@/pages/RetailerLogin';
import ConsumerLogin from '@/pages/ConsumerLogin';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// New Role Pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import { FarmerLayout } from "@/components/FarmerLayout";
import { DistributorLayout } from "@/components/DistributorLayout";
import { RetailerLayout } from "@/components/RetailerLayout";
import { ConsumerLayout } from "@/components/ConsumerLayout";
import { useAuth } from '@/hooks/useAuth';

const queryClient = new QueryClient();

// Simple test component to verify rendering
const TestComponent = () => {
  console.log('🧪 TestComponent rendered');
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Component</h1>
        <p>If you can see this, React is working!</p>
      </div>
    </div>
  );
};

function ProtectedRoute({ role }: { role: 'vendor' | 'supplier' }) {
  const { user, role: userRole, loading, error } = useAuth();
  
  console.log('🔍 ProtectedRoute:', { role, user: !!user, userRole, loading, error });
  
  if (loading) {
    console.log('⏳ ProtectedRoute: Loading...');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-lg mb-4">Loading...</div>
        <div className="text-sm text-muted-foreground">Checking authentication...</div>
      </div>
    );
  }
  
  if (error) {
    console.log('❌ ProtectedRoute: Error:', error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-lg mb-4 text-destructive">Authentication Error</div>
        <div className="text-sm text-muted-foreground mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!user) {
    console.log('🚫 ProtectedRoute: No user, redirecting to /');
    return <Navigate to="/" />;
  }
  
  if (userRole !== role) {
    console.log('🚫 ProtectedRoute: Role mismatch, redirecting to /');
    return <Navigate to="/" />;
  }
  
  console.log('✅ ProtectedRoute: Access granted');
  return <Outlet />;
}

function AppRoutes() {
  const { user, role, loading, error } = useAuth();

  console.log('🔍 AppRoutes: State:', { user: !!user, role, loading, error });

  // Show error state if there's an authentication error
  if (error && !loading) {
    console.log('❌ AppRoutes: Showing error state');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-lg mb-4 text-destructive">Authentication Error</div>
        <div className="text-sm text-muted-foreground mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  console.log('✅ AppRoutes: Rendering main app structure');

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/test" element={<TestComponent />} />
      
      <Route path="/farmer-login" element={user && role === 'farmer' ? <Navigate to="/farmer/dashboard" /> : <FarmerLogin />} />
      <Route path="/distributor-login" element={user && role === 'distributor' ? <Navigate to="/distributor/dashboard" /> : <DistributorLogin />} />
      <Route path="/retailer-login" element={user && role === 'retailer' ? <Navigate to="/retailer/dashboard" /> : <RetailerLogin />} />
      <Route path="/consumer-login" element={user && role === 'consumer' ? <Navigate to="/consumer/home" /> : <ConsumerLogin />} />
      
      <Route path="/farmer/dashboard" element={<FarmerLayout><FarmerDashboard /></FarmerLayout>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
