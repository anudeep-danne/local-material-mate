import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['users']['Row'] & {
  averageRating: number;
  totalReviews: number;
  productsCount: number;
  averagePrice: number;
  specialties: string[];
  displayName: string;
  displayPhone: string;
  displayLocation: string;
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
        .select('*')
        .eq('role', 'supplier');

      if (suppliersError) throw suppliersError;

      // Transform to match expected type
      const enrichedSuppliers: Supplier[] = (allSuppliers || []).map(supplier => ({
        ...supplier,
        averageRating: 0,
        totalReviews: 0,
        productsCount: 0,
        averagePrice: 0,
        specialties: [],
        displayName: supplier.business_name || supplier.name || 'Business Name Not Set',
        displayPhone: supplier.phone || 'Phone Not Set',
        displayLocation: supplier.city && supplier.state ? `${supplier.city}, ${supplier.state}` : 
                       supplier.city || supplier.state || 'Location Not Set'
      }));

      setSuppliers(enrichedSuppliers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [locationFilter, radiusFilter]);

  const getRecentSuppliers = useCallback(async () => {
    if (!vendorId) return [];
    
    try {
      // For now, return empty array since orders schema has changed
      return [];
    } catch (err) {
      console.error('Error fetching recent suppliers:', err);
      return [];
    }
  }, [vendorId]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    getRecentSuppliers,
    refetch: fetchSuppliers
  };
};