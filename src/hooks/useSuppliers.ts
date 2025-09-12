import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['users']['Row'] & {
  averageRating: number;
  totalReviews: number;
  productsCount: number;
  averagePrice: number;
  specialties: string[];
  certifications: string | null;
  fleet_size: number | null;
  gst_number: string | null;
  license_number: string | null;
};

export const useSuppliers = (vendorId?: string, locationFilter?: string, radiusFilter?: number) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all suppliers (users with role 'supplier')
      const { data: allSuppliers, error: suppliersError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          business_name,
          phone,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          description,
          created_at,
          certifications,
          fleet_size,
          gst_number,
          license_number
        `)
        .eq('role', 'farmer');

      if (suppliersError) throw suppliersError;

      // Get suppliers with detailed information
      const suppliersWithDetails = await Promise.all(
        allSuppliers.map(async (supplier) => {
          // Get reviews for this supplier
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('supplier_id', supplier.id);

          // Get batches for this farmer (new supplier)
          const { data: batches } = await supabase
            .from('batches')
            .select('price_per_kg, crop_type')
            .eq('farmer_id', supplier.id);

          // Calculate ratings
          const ratings = reviews?.map(r => r.rating) || [];
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0;

          // Calculate batch stats
          const prices = batches?.map(b => b.price_per_kg) || [];
          const averagePrice = prices.length > 0 
            ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
            : 0;

          // Get unique crop types (specialties)
          const cropTypes = batches?.map(b => b.crop_type) || [];
          const uniqueCategories = [...new Set(cropTypes)];

          // Process supplier data to handle incomplete information
          const processedSupplier = {
            ...supplier,
            // Provide fallbacks for missing data
            business_name: supplier.business_name || supplier.name || 'Business Name Not Set',
            phone: supplier.phone || 'Phone Not Set',
            city: supplier.city || 'Location Not Set',
            state: supplier.state || '',
            address: supplier.address || 'Address Not Set',
            averageRating,
            totalReviews: ratings.length,
            productsCount: batches?.length || 0,
            averagePrice,
            specialties: uniqueCategories,
            certifications: supplier.certifications,
            fleet_size: supplier.fleet_size,
            gst_number: supplier.gst_number,
            license_number: supplier.license_number
          };

          return processedSupplier;
        })
      );

      // Apply location filtering if specified
      let filteredSuppliers = suppliersWithDetails;
      if (locationFilter && radiusFilter) {
        filteredSuppliers = suppliersWithDetails.filter(supplier => {
          if (!supplier.latitude || !supplier.longitude) {
            return false; // Skip suppliers without location data
          }
          
          // For demo purposes, we'll use a simple city-based filter
          // In a real app, you'd calculate actual distance using coordinates
          const supplierLocation = `${supplier.city || ''} ${supplier.state || ''}`.toLowerCase();
          const filterLocation = locationFilter.toLowerCase();
          
          return supplierLocation.includes(filterLocation) || filterLocation.includes(supplierLocation);
        });
      }

      setSuppliers(filteredSuppliers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [locationFilter, radiusFilter]);

  const getRecentSuppliers = useCallback(async () => {
    if (!vendorId) return [];
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          supplier:users!orders_supplier_id_fkey(
            id,
            name,
            role
          )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique suppliers
      const uniqueSuppliers = data.reduce((acc: any[], order) => {
        const supplier = order.supplier;
        if (supplier && !acc.find(s => s.id === supplier.id)) {
          acc.push(supplier);
        }
        return acc;
      }, []);

      // Get full supplier details for recent suppliers
      const recentSuppliersWithDetails = await Promise.all(
        uniqueSuppliers.map(async (supplier) => {
          const fullSupplier = suppliers.find(s => s.id === supplier.id);
          return fullSupplier || supplier;
        })
      );

      return recentSuppliersWithDetails;
    } catch (err) {
      console.error('Error fetching recent suppliers:', err);
      return [];
    }
  }, [vendorId, suppliers]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Listen for account updates to refresh supplier data
  useEffect(() => {
    const handleAccountUpdate = (event: CustomEvent) => {
      console.log('🔄 Suppliers: Account update received, refreshing suppliers');
      fetchSuppliers();
    };

    const handleSupplierUpdate = (event: CustomEvent) => {
      console.log('🔄 Suppliers: Supplier update received, refreshing suppliers');
      fetchSuppliers();
    };

    window.addEventListener('accountUpdated', handleAccountUpdate as EventListener);
    window.addEventListener('supplierUpdated', handleSupplierUpdate as EventListener);

    return () => {
      window.removeEventListener('accountUpdated', handleAccountUpdate as EventListener);
      window.removeEventListener('supplierUpdated', handleSupplierUpdate as EventListener);
    };
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    getRecentSuppliers,
    refetch: fetchSuppliers
  };
}; 