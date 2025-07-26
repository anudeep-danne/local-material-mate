import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type SupplierProfile = Database['public']['Tables']['users']['Row'];

export const useSupplierProfile = (supplierId: string) => {
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supplierId)
        .eq('role', 'supplier')
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<SupplierProfile>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', supplierId);

      if (error) throw error;
      toast.success('Profile updated successfully');
      await fetchProfile();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (supplierId) {
      fetchProfile();
    }
  }, [supplierId]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};