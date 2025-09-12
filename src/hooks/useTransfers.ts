import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Transfer = Tables<'transfers'>;
type TransferInsert = TablesInsert<'transfers'>;
type TransferUpdate = TablesUpdate<'transfers'>;

export const useTransfers = (userId?: string) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('transfers').select(`
        *,
        batch:batches(*),
        from_user:users!transfers_from_user_id_fkey(name, business_name),
        to_user:users!transfers_to_user_id_fkey(name, business_name)
      `).order('created_at', { ascending: false });
      
      if (userId) {
        query = query.or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transfers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransfer = async (transferData: TransferInsert) => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .insert(transferData)
        .select()
        .single();

      if (error) throw error;

      setTransfers(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Transfer created successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast({
        title: "Error",
        description: "Failed to create transfer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTransferStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTransfers(prev => prev.map(transfer => transfer.id === id ? data : transfer));
      toast({
        title: "Success",
        description: "Transfer status updated successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error updating transfer:', error);
      toast({
        title: "Error",
        description: "Failed to update transfer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [userId]);

  return {
    transfers,
    loading,
    createTransfer,
    updateTransferStatus,
    refetch: fetchTransfers
  };
};