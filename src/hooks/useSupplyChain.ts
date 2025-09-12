import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Batch {
  id: string;
  farmer_id: string;
  crop: string;
  total_quantity_kg: number;
  available_quantity_kg: number;
  price_per_kg: number;
  harvest_date: string;
  location: string;
  metadata_json: any;
  parent_batch_id?: string;
  status: string;
  created_at: string;
  farmer?: {
    name: string;
    email: string;
    city?: string;
    state?: string;
  };
}

export interface Transfer {
  id: string;
  batch_id: string;
  from_user_id: string;
  to_user_id: string;
  quantity_kg: number;
  transfer_type: string;
  notes?: string;
  status: string;
  created_at: string;
}

export interface Inventory {
  id: string;
  retailer_id: string;
  source_batch_id: string;
  quantity_available: number;
  retail_price_per_kg: number;
  expiry_date?: string;
  created_at: string;
}

export interface Order {
  id: string;
  consumer_id: string;
  retailer_id: string;
  total_amount: number;
  status: string;
  address_json: any;
  created_at: string;
}

export const useSupplyChain = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createBatch = async (batchData: {
    crop: string;
    total_quantity_kg: number;
    price_per_kg: number;
    harvest_date: string;
    location: string;
    metadata?: any;
  }) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-batch', {
        body: batchData,
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Batch created successfully!",
      });

      return response.data;
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBatches = async (filters?: {
    crop?: string;
    location?: string;
    max_price?: number;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.crop) params.append('crop', filters.crop);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.max_price) params.append('max_price', filters.max_price.toString());

      const response = await supabase.functions.invoke('get-batches', {
        method: 'GET',
      });

      if (response.error) throw response.error;
      return response.data.batches;
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch batches. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const buyBatch = async (batchId: string, quantity: number, priceOffered: number) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('buy-batch', {
        body: {
          batch_id: batchId,
          qty: quantity,
          price_offered: priceOffered,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;

      if (response.data.error) {
        toast({
          title: "Error",
          description: response.data.error,
          variant: "destructive",
        });
        return response.data;
      }

      toast({
        title: "Success",
        description: "Batch purchased successfully!",
      });

      return response.data;
    } catch (error) {
      console.error('Error buying batch:', error);
      toast({
        title: "Error",
        description: "Failed to purchase batch. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sellToRetailer = async (
    subBatchId: string,
    retailerId: string,
    quantity: number,
    pricePerKg: number,
    shippingInfo?: any
  ) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('sell-to-retailer', {
        body: {
          sub_batch_id: subBatchId,
          retailer_id: retailerId,
          qty: quantity,
          price_per_kg: pricePerKg,
          shipping_info: shippingInfo,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;

      if (response.data.error) {
        toast({
          title: "Error",
          description: response.data.error,
          variant: "destructive",
        });
        return response.data;
      }

      toast({
        title: "Success",
        description: "Product sold to retailer successfully!",
      });

      return response.data;
    } catch (error) {
      console.error('Error selling to retailer:', error);
      toast({
        title: "Error",
        description: "Failed to sell to retailer. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    retailerId: string,
    items: Array<{ inventory_id: string; quantity: number }>,
    address: any
  ) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-order', {
        body: {
          retailer_id: retailerId,
          items,
          address,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;

      if (response.data.error) {
        toast({
          title: "Error",
          description: response.data.error,
          variant: "destructive",
        });
        return response.data;
      }

      toast({
        title: "Success",
        description: "Order placed successfully!",
      });

      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTrace = async (batchId: string) => {
    try {
      setLoading(true);
      const response = await supabase.functions.invoke('get-trace', {
        method: 'GET',
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Error fetching trace:', error);
      toast({
        title: "Error",
        description: "Failed to fetch supply chain trace. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createBatch,
    getBatches,
    buyBatch,
    sellToRetailer,
    createOrder,
    getTrace,
  };
};