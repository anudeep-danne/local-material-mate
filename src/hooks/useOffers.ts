import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Offer = Tables<'offers'>;
type OfferInsert = TablesInsert<'offers'>;
type OfferUpdate = TablesUpdate<'offers'>;

export const useOffers = (userId?: string, userRole?: string) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOffers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('offers').select(`
        *,
        batch:batches(*),
        distributor:users!offers_distributor_id_fkey(name, business_name),
        farmer:users!offers_farmer_id_fkey(name, business_name)
      `).order('created_at', { ascending: false });
      
      if (userId && userRole) {
        if (userRole === 'farmer') {
          query = query.eq('farmer_id', userId);
        } else if (userRole === 'distributor') {
          query = query.eq('distributor_id', userId);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOffer = async (offerData: Omit<OfferInsert, 'distributor_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('offers')
        .insert({
          ...offerData,
          distributor_id: user.id,
          total_offer_amount: offerData.quantity * offerData.offered_price_per_kg
        })
        .select()
        .single();

      if (error) throw error;

      setOffers(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Offer created successfully!",
      });
      return data;
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: "Failed to create offer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOfferStatus = async (id: string, status: 'Accepted' | 'Rejected') => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOffers(prev => prev.map(offer => offer.id === id ? data : offer));
      toast({
        title: "Success",
        description: `Offer ${status.toLowerCase()} successfully!`,
      });
      return data;
    } catch (error) {
      console.error('Error updating offer:', error);
      toast({
        title: "Error",
        description: "Failed to update offer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [userId, userRole]);

  return {
    offers,
    loading,
    createOffer,
    updateOfferStatus,
    refetch: fetchOffers
  };
};