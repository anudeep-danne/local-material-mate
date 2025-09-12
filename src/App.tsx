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

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import BrowseProducts from "./pages/vendor/BrowseProducts";
import Cart from "./pages/vendor/Cart";
import MyOrders from "./pages/vendor/MyOrders";
import CompareSuppliers from "./pages/vendor/CompareSuppliers";
import VendorReviews from "./pages/vendor/VendorReviews";
import VendorAccountSettings from "./pages/vendor/AccountSettings";

// Supplier Pages
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import MyProducts from "./pages/supplier/MyProducts";
import AddProduct from "./pages/supplier/AddProduct";
import EditProduct from "./pages/supplier/EditProduct";
import IncomingOrders from "./pages/supplier/IncomingOrders";
import SupplierReviews from "./pages/supplier/SupplierReviews";
import SupplierAccountSettings from "./pages/supplier/AccountSettings";
import DebugAuth from "./pages/supplier/DebugAuth";
import { SupplierLayout } from "@/components/SupplierLayout";
import { VendorLayout } from "@/components/VendorLayout";
import { useAuth } from '@/hooks/useAuth';
import { CartProvider } from '@/contexts/CartContext';

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
      <Route path="/debug-auth" element={<DebugAuth />} />
      <Route path="/vendor-login" element={user && role === 'vendor' ? <Navigate to="/vendor/dashboard" /> : <VendorLogin />} />
      <Route path="/supplier-login" element={user && role === 'supplier' ? <Navigate to="/supplier/dashboard" /> : <SupplierLogin />} />
      <Route path="/vendor/dashboard" element={<VendorLayout><VendorDashboard /></VendorLayout>} />
      <Route path="/vendor/browse" element={<VendorLayout><BrowseProducts /></VendorLayout>} />
      <Route path="/vendor/cart" element={<VendorLayout><Cart /></VendorLayout>} />
      <Route path="/vendor/orders" element={<VendorLayout><MyOrders /></VendorLayout>} />
      <Route path="/vendor/compare" element={<VendorLayout><CompareSuppliers /></VendorLayout>} />
      <Route path="/vendor/reviews" element={<VendorLayout><VendorReviews /></VendorLayout>} />
      <Route path="/vendor/account" element={<VendorLayout><VendorAccountSettings /></VendorLayout>} />
      <Route path="/supplier/dashboard" element={<SupplierLayout><SupplierDashboard /></SupplierLayout>} />
      <Route path="/supplier/products" element={<SupplierLayout><MyProducts /></SupplierLayout>} />
      <Route path="/supplier/add-product" element={<SupplierLayout><AddProduct /></SupplierLayout>} />
      <Route path="/supplier/edit-product/:productId" element={<SupplierLayout><EditProduct /></SupplierLayout>} />
      <Route path="/supplier/orders" element={<SupplierLayout><IncomingOrders /></SupplierLayout>} />
      <Route path="/supplier/reviews" element={<SupplierLayout><SupplierReviews /></SupplierLayout>} />
      <Route path="/supplier/settings" element={<SupplierLayout><SupplierAccountSettings /></SupplierLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
          <Toaster />
          <Sonner />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
