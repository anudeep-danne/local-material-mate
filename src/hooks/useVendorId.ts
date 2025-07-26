import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVendorId = () => {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No authenticated user');
      
      // Verify user is a vendor
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;
      if (userData.role !== 'vendor') {
        throw new Error('User is not a vendor');
      }
      
      setVendorId(user.id);
      return user.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current user');
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    getCurrentUser().then(() => {
      setLoading(false);
    });
  }, []);

  return { vendorId, loading, error };
}; 