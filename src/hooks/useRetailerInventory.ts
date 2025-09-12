import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type InventoryItem = Database['public']['Tables']['retailer_inventory']['Row'] & {
  batch: Database['public']['Tables']['batches']['Row'] & {
    farmer: Database['public']['Tables']['users']['Row'];
  };
};

export const useRetailerInventory = (userId: string | null) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    if (!userId) {
      setInventory([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('retailer_inventory')
        .select(`
          *,
          batch:batches!retailer_inventory_batch_id_fkey(
            *,
            farmer:users!batches_farmer_id_fkey(*)
          )
        `)
        .eq('retailer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data as unknown as InventoryItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const addToInventory = async (inventoryData: {
    batch_id: string;
    quantity: number;
    retail_price_per_kg: number;
    expiry_date?: string;
  }) => {
    try {
      if (!userId) throw new Error('No user ID');

      const { error } = await supabase
        .from('retailer_inventory')
        .insert({
          retailer_id: userId,
          batch_id: inventoryData.batch_id,
          quantity: inventoryData.quantity,
          retail_price_per_kg: inventoryData.retail_price_per_kg,
          expiry_date: inventoryData.expiry_date,
          status: 'In Stock'
        });

      if (error) throw error;
      
      toast.success('Item added to inventory!');
      await fetchInventory();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to inventory';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const updateInventoryItem = async (
    itemId: string, 
    updates: {
      quantity?: number;
      retail_price_per_kg?: number;
      expiry_date?: string;
      status?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('retailer_inventory')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
      
      await fetchInventory();
      toast.success('Inventory updated!');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update inventory';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const deleteInventoryItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('retailer_inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      await fetchInventory();
      toast.success('Item removed from inventory!');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchInventory();
    }
  }, [userId]);

  return {
    inventory,
    loading,
    error,
    addToInventory,
    updateInventoryItem,
    deleteInventoryItem,
    refetch: fetchInventory
  };
};