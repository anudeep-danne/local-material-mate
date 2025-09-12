import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Transfer = Database['public']['Tables']['transfers']['Row'] & {
  batch: Database['public']['Tables']['batches']['Row'];
  from_user: Database['public']['Tables']['users']['Row'];
  to_user: Database['public']['Tables']['users']['Row'];
};

export const useTransfers = (userId: string | null, userRole: string) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = async () => {
    if (!userId) {
      setTransfers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          batch:batches!transfers_batch_id_fkey(*),
          from_user:users!transfers_from_user_id_fkey(*),
          to_user:users!transfers_to_user_id_fkey(*)
        `)
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data as unknown as Transfer[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  const updateTransferStatus = async (transferId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('transfers')
        .update({ status })
        .eq('id', transferId);

      if (error) throw error;
      
      await fetchTransfers();
      toast.success('Transfer status updated!');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transfer';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const createTransfer = async (transferData: {
    batch_id: string;
    to_user_id: string;
    quantity: number;
    price_per_kg: number;
    transfer_type: 'farmer_to_distributor' | 'distributor_to_retailer';
    notes?: string;
  }) => {
    try {
      if (!userId) throw new Error('No user ID');

      const total_amount = transferData.quantity * transferData.price_per_kg;

      const { error } = await supabase
        .from('transfers')
        .insert({
          batch_id: transferData.batch_id,
          from_user_id: userId,
          to_user_id: transferData.to_user_id,
          quantity: transferData.quantity,
          price_per_kg: transferData.price_per_kg,
          total_amount,
          transfer_type: transferData.transfer_type,
          notes: transferData.notes,
          status: 'Pending'
        });

      if (error) throw error;
      
      toast.success('Transfer created successfully!');
      await fetchTransfers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transfer';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      fetchTransfers();
    }
  }, [userId, userRole]);

  return {
    transfers,
    loading,
    error,
    createTransfer,
    updateTransferStatus,
    refetch: fetchTransfers
  };
};