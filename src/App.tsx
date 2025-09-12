import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster as Sonner } from '@/components/ui/sonner';

// Pages
import Welcome from '@/pages/Welcome';
import NotFound from '@/pages/NotFound';

// Farmer pages  
import FarmerDashboard from '@/pages/farmer/FarmerDashboard';
import CreateBatch from '@/pages/farmer/CreateBatch';
import MyBatches from '@/pages/farmer/MyBatches';
import FarmerOffers from '@/pages/farmer/Offers';
import FarmerTransactions from '@/pages/farmer/Transactions';
import FarmerProfile from '@/pages/farmer/Profile';

// Distributor pages
import DistributorDashboard from '@/pages/distributor/DistributorDashboard';
import AvailableBatches from '@/pages/distributor/AvailableBatches';
import DistributorPurchases from '@/pages/distributor/Purchases';
import SellToRetailer from '@/pages/distributor/SellToRetailer';
import DistributorShipments from '@/pages/distributor/Shipments';
import DistributorTransactions from '@/pages/distributor/Transactions';
import DistributorProfile from '@/pages/distributor/Profile';

// Retailer pages
import RetailerDashboard from '@/pages/retailer/RetailerDashboard';
import RetailerBatches from '@/pages/retailer/AvailableBatches';
import IncomingShipments from '@/pages/retailer/IncomingShipments';
import RetailerInventory from '@/pages/retailer/Inventory';
import RetailerTransactions from '@/pages/retailer/Transactions';
import RetailerProfile from '@/pages/retailer/Profile';

// Consumer pages
import ConsumerHome from '@/pages/consumer/ConsumerHome';
import BuyProducts from '@/pages/consumer/BuyProducts';
import TraceProduce from '@/pages/consumer/TraceProduce';
import About from '@/pages/consumer/About';
import Contact from '@/pages/consumer/Contact';

// Layouts
import { FarmerLayout } from '@/components/FarmerLayout';
import { ConsumerLayout } from '@/components/ConsumerLayout';
import { RetailerLayout } from '@/components/RetailerLayout';
import { DistributorLayout } from '@/components/DistributorLayout';

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Welcome />} />
      <Route path="/welcome" element={<Welcome />} />

      {/* Farmer routes */}
      <Route path="/farmer/dashboard" element={
        <FarmerLayout>
          <FarmerDashboard />
        </FarmerLayout>
      } />
      <Route path="/farmer/create-batch" element={
        <FarmerLayout>
          <CreateBatch />
        </FarmerLayout>
      } />
      <Route path="/farmer/batches" element={
        <FarmerLayout>
          <MyBatches />
        </FarmerLayout>
      } />
      <Route path="/farmer/offers" element={
        <FarmerLayout>
          <FarmerOffers />
        </FarmerLayout>
      } />
      <Route path="/farmer/transactions" element={
        <FarmerLayout>
          <FarmerTransactions />
        </FarmerLayout>
      } />
      <Route path="/farmer/profile" element={
        <FarmerLayout>
          <FarmerProfile />
        </FarmerLayout>
      } />

      {/* Distributor routes */}
      <Route path="/distributor/dashboard" element={
        <DistributorLayout>
          <DistributorDashboard />
        </DistributorLayout>
      } />
      <Route path="/distributor/batches" element={
        <DistributorLayout>
          <AvailableBatches />
        </DistributorLayout>
      } />
      <Route path="/distributor/purchases" element={
        <DistributorLayout>
          <DistributorPurchases />
        </DistributorLayout>
      } />
      <Route path="/distributor/sell" element={
        <DistributorLayout>
          <SellToRetailer />
        </DistributorLayout>
      } />
      <Route path="/distributor/shipments" element={
        <DistributorLayout>
          <DistributorShipments />
        </DistributorLayout>
      } />
      <Route path="/distributor/transactions" element={
        <DistributorLayout>
          <DistributorTransactions />
        </DistributorLayout>
      } />
      <Route path="/distributor/profile" element={
        <DistributorLayout>
          <DistributorProfile />
        </DistributorLayout>
      } />

      {/* Retailer routes */}
      <Route path="/retailer/dashboard" element={
        <RetailerLayout>
          <RetailerDashboard />
        </RetailerLayout>
      } />
      <Route path="/retailer/batches" element={
        <RetailerLayout>
          <RetailerBatches />
        </RetailerLayout>
      } />
      <Route path="/retailer/shipments" element={
        <RetailerLayout>
          <IncomingShipments />
        </RetailerLayout>
      } />
      <Route path="/retailer/inventory" element={
        <RetailerLayout>
          <RetailerInventory />
        </RetailerLayout>
      } />
      <Route path="/retailer/transactions" element={
        <RetailerLayout>
          <RetailerTransactions />
        </RetailerLayout>
      } />
      <Route path="/retailer/profile" element={
        <RetailerLayout>
          <RetailerProfile />
        </RetailerLayout>
      } />

      {/* Consumer routes */}
      <Route path="/consumer/home" element={
        <ConsumerLayout>
          <ConsumerHome />
        </ConsumerLayout>
      } />
      <Route path="/consumer/buy" element={
        <ConsumerLayout>
          <BuyProducts />
        </ConsumerLayout>
      } />
      <Route path="/consumer/trace" element={
        <ConsumerLayout>
          <TraceProduce />
        </ConsumerLayout>
      } />
      <Route path="/consumer/about" element={
        <ConsumerLayout>
          <About />
        </ConsumerLayout>
      } />
      <Route path="/consumer/contact" element={
        <ConsumerLayout>
          <Contact />
        </ConsumerLayout>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Router>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </Router>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;