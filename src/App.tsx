import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from '@/pages/Welcome';
import FarmerLogin from '@/pages/FarmerLogin';
import DistributorLogin from '@/pages/DistributorLogin';
import RetailerLogin from '@/pages/RetailerLogin';
import ConsumerLogin from '@/pages/ConsumerLogin';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Supply Chain Pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import DistributorDashboard from "./pages/distributor/DistributorDashboard";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import ConsumerHome from "./pages/consumer/ConsumerHome";

// Layouts
import { FarmerLayout } from "@/components/FarmerLayout";
import { DistributorLayout } from "@/components/DistributorLayout";
import { RetailerLayout } from "@/components/RetailerLayout";
import { ConsumerLayout } from "@/components/ConsumerLayout";

import { useAuth } from '@/hooks/useAuth';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, role, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-lg mb-4 text-red-600">Authentication Error</div>
        <div className="text-sm text-gray-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      
      {/* Login Routes */}
      <Route 
        path="/farmer-login" 
        element={user && role === 'farmer' ? <Navigate to="/farmer/dashboard" /> : <FarmerLogin />} 
      />
      <Route 
        path="/distributor-login" 
        element={user && role === 'distributor' ? <Navigate to="/distributor/dashboard" /> : <DistributorLogin />} 
      />
      <Route 
        path="/retailer-login" 
        element={user && role === 'retailer' ? <Navigate to="/retailer/dashboard" /> : <RetailerLogin />} 
      />
      <Route 
        path="/consumer-login" 
        element={user && role === 'consumer' ? <Navigate to="/consumer/home" /> : <ConsumerLogin />} 
      />
      
      {/* Dashboard Routes */}
      <Route 
        path="/farmer/dashboard" 
        element={
          user && role === 'farmer' 
            ? <FarmerLayout><FarmerDashboard /></FarmerLayout>
            : <Navigate to="/farmer-login" />
        } 
      />
      <Route 
        path="/distributor/dashboard" 
        element={
          user && role === 'distributor' 
            ? <DistributorLayout><DistributorDashboard /></DistributorLayout>
            : <Navigate to="/distributor-login" />
        } 
      />
      <Route 
        path="/retailer/dashboard" 
        element={
          user && role === 'retailer' 
            ? <RetailerLayout><RetailerDashboard /></RetailerLayout>
            : <Navigate to="/retailer-login" />
        } 
      />
      <Route 
        path="/consumer/home" 
        element={
          user && role === 'consumer' 
            ? <ConsumerLayout><ConsumerHome /></ConsumerLayout>
            : <Navigate to="/consumer-login" />
        } 
      />
      
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