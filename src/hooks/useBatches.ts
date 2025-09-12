import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Batch = Tables<'batches'>;
type BatchInsert = TablesInsert<'batches'>;
type BatchUpdate = TablesUpdate<'batches'>;

export const useBatches = (userId?: string) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBatches = async () => {
    try {
      setLoading(true);
      let query = supabase.from('batches').select('*').order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('farmer_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch batches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (batchData: Omit<BatchInsert, 'farmer_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('batches')
        .insert({
          ...batchData,
          farmer_id: user.id,
          remaining_quantity: batchData.quantity
        })
        .select()
        .single();

      if (error) throw error;

      setBatches(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Batch created successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBatch = async (id: string, updates: BatchUpdate) => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBatches(prev => prev.map(batch => batch.id === id ? data : batch));
      toast({
        title: "Success",
        description: "Batch updated successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error updating batch:', error);
      toast({
        title: "Error",
        description: "Failed to update batch. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBatch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBatches(prev => prev.filter(batch => batch.id !== id));
      toast({
        title: "Success",
        description: "Batch deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast({
        title: "Error",
        description: "Failed to delete batch. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [userId]);

  return {
    batches,
    loading,
    createBatch,
    updateBatch,
    deleteBatch,
    refetch: fetchBatches
  };
};