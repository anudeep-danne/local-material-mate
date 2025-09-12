import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  retailer_id: string;
  source_batch_id: string;
  quantity_available: number;
  retail_price_per_kg: number;
  expiry_date?: string;
  created_at: string;
  source_batch?: {
    crop: string;
    harvest_date: string;
    location: string;
  };
}

export const useInventory = (retailerId?: string) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let query = supabase.from('inventory').select(`
        *,
        source_batch:batches!source_batch_id(crop, harvest_date, location)
      `).order('created_at', { ascending: false });
      
      if (retailerId) {
        query = query.eq('retailer_id', retailerId);
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

  const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      setInventory(prev => prev.map(item => item.id === itemId ? { ...item, ...data } : item));
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

  useEffect(() => {
    fetchInventory();
  }, [retailerId]);

  return {
    inventory,
    loading,
    updateInventoryItem,
    refetch: fetchInventory
  };
};