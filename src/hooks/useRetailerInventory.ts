import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type RetailerInventory = Tables<'retailer_inventory'>;
type RetailerInventoryInsert = TablesInsert<'retailer_inventory'>;
type RetailerInventoryUpdate = TablesUpdate<'retailer_inventory'>;

export const useRetailerInventory = (userId?: string) => {
  const [inventory, setInventory] = useState<RetailerInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let query = supabase.from('retailer_inventory').select(`
        *,
        batch:batches(*)
      `).order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('retailer_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToInventory = async (inventoryData: Omit<RetailerInventoryInsert, 'retailer_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('retailer_inventory')
        .insert({
          ...inventoryData,
          retailer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setInventory(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Item added to inventory successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error adding to inventory:', error);
      toast({
        title: "Error",
        description: "Failed to add item to inventory. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateInventoryItem = async (id: string, updates: RetailerInventoryUpdate) => {
    try {
      const { data, error } = await supabase
        .from('retailer_inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInventory(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Success",
        description: "Inventory item updated successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('retailer_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInventory(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Inventory item deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [userId]);

  return {
    inventory,
    loading,
    addToInventory,
    updateInventoryItem,
    deleteInventoryItem,
    refetch: fetchInventory
  };
};