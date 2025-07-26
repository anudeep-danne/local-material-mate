import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import BrowseProducts from "./pages/vendor/BrowseProducts";
import Cart from "./pages/vendor/Cart";
import MyOrders from "./pages/vendor/MyOrders";
import CompareSuppliers from "./pages/vendor/CompareSuppliers";
import VendorReviews from "./pages/vendor/VendorReviews";

// Supplier Pages
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import MyProducts from "./pages/supplier/MyProducts";
import AddProduct from "./pages/supplier/AddProduct";
import IncomingOrders from "./pages/supplier/IncomingOrders";
import SupplierReviews from "./pages/supplier/SupplierReviews";
import AccountSettings from "./pages/supplier/AccountSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/browse" element={<BrowseProducts />} />
          <Route path="/vendor/cart" element={<Cart />} />
          <Route path="/vendor/orders" element={<MyOrders />} />
          <Route path="/vendor/compare" element={<CompareSuppliers />} />
          <Route path="/vendor/reviews" element={<VendorReviews />} />
          
          {/* Supplier Routes */}
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier/products" element={<MyProducts />} />
          <Route path="/supplier/add-product" element={<AddProduct />} />
          <Route path="/supplier/orders" element={<IncomingOrders />} />
          <Route path="/supplier/reviews" element={<SupplierReviews />} />
          <Route path="/supplier/settings" element={<AccountSettings />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
