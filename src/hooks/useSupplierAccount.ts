import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type SupplierAccount = Database['public']['Tables']['users']['Row'];

export const useSupplierAccount = (supplierId: string) => {
  const [account, setAccount] = useState<SupplierAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supplierId)
        .single();

      if (error) throw error;
      setAccount(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (updates: Partial<SupplierAccount>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', supplierId);

      if (error) throw error;
      toast.success('Account updated successfully');
      await fetchAccount();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update account';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (supplierId) {
      fetchAccount();
    }
  }, [supplierId]);

  return {
    account,
    loading,
    error,
    updateAccount,
    refetch: fetchAccount
  };
};