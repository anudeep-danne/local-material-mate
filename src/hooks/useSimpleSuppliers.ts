import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSimpleSuppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, name, business_name, email')
          .eq('role', 'supplier');

        if (error) throw error;
        setSuppliers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error
  };
};