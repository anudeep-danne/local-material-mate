import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Offer = Database['public']['Tables']['offers']['Row'] & {
  batch: Database['public']['Tables']['batches']['Row'] & {
    farmer: Database['public']['Tables']['users']['Row'];
  };
  distributor: Database['public']['Tables']['users']['Row'];
};

export const useOffers = (userId: string | null, userRole: string) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    if (!userId) {
      setOffers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('offers')
        .select(`
          *,
          batch:batches!offers_batch_id_fkey(
            *,
            farmer:users!batches_farmer_id_fkey(*)
          ),
          distributor:users!offers_distributor_id_fkey(*)
        `);

      if (userRole === 'farmer') {
        query = query.eq('farmer_id', userId);
      } else if (userRole === 'distributor') {
        query = query.eq('distributor_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data as unknown as Offer[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const createOffer = async (offerData: {
    batch_id: string;
    farmer_id: string;
    quantity: number;
    offered_price_per_kg: number;
    notes?: string;
  }) => {
    try {
      if (!userId) throw new Error('No user ID');

      const total_offer_amount = offerData.quantity * offerData.offered_price_per_kg;

      const { error } = await supabase
        .from('offers')
        .insert({
          batch_id: offerData.batch_id,
          distributor_id: userId,
          farmer_id: offerData.farmer_id,
          quantity: offerData.quantity,
          offered_price_per_kg: offerData.offered_price_per_kg,
          total_offer_amount,
          notes: offerData.notes,
          status: 'Pending'
        });

      if (error) throw error;
      
      toast.success('Offer submitted successfully!');
      await fetchOffers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create offer';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const respondToOffer = async (offerId: string, status: 'Accepted' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status })
        .eq('id', offerId);

      if (error) throw error;

      // If accepted, create a transfer record
      if (status === 'Accepted') {
        const offer = offers.find(o => o.id === offerId);
        if (offer) {
          const { error: transferError } = await supabase
            .from('transfers')
            .insert({
              batch_id: offer.batch_id,
              from_user_id: offer.farmer_id,
              to_user_id: offer.distributor_id,
              quantity: offer.quantity,
              price_per_kg: offer.offered_price_per_kg,
              total_amount: offer.total_offer_amount,
              transfer_type: 'farmer_to_distributor',
              status: 'Confirmed'
            });

          if (transferError) throw transferError;
        }
      }
      
      await fetchOffers();
      toast.success(`Offer ${status.toLowerCase()} successfully!`);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to respond to offer';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      fetchOffers();
    }
  }, [userId, userRole]);

  return {
    offers,
    loading,
    error,
    createOffer,
    respondToOffer,
    refetch: fetchOffers
  };
};