import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Batch = Database['public']['Tables']['batches']['Row'] & {
  farmer: Database['public']['Tables']['users']['Row'];
};

export const useBatches = (userId: string | null, userRole: string) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = async () => {
    if (!userId) {
      setBatches([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('batches')
        .select(`
          *,
          farmer:users!batches_farmer_id_fkey(*)
        `);

      // Filter based on user role
      if (userRole === 'farmer') {
        query = query.eq('farmer_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data as unknown as Batch[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (batchData: {
    crop_type: string;
    quantity: number;
    harvest_date: string;
    price_per_kg: number;
  }) => {
    try {
      if (!userId) throw new Error('No user ID');

      const { error } = await supabase
        .from('batches')
        .insert({
          farmer_id: userId,
          crop_type: batchData.crop_type,
          quantity: batchData.quantity,
          harvest_date: batchData.harvest_date,
          price_per_kg: batchData.price_per_kg,
          remaining_quantity: batchData.quantity,
          status: 'Available'
        });

      if (error) throw error;
      
      toast.success('Batch created successfully!');
      await fetchBatches();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create batch';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const updateBatchStatus = async (batchId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('batches')
        .update({ status })
        .eq('id', batchId);

      if (error) throw error;
      
      await fetchBatches();
      toast.success('Batch status updated!');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update batch';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      fetchBatches();
    }
  }, [userId, userRole]);

  return {
    batches,
    loading,
    error,
    createBatch,
    updateBatchStatus,
    refetch: fetchBatches
  };
};