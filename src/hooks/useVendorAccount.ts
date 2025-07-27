import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAccountSync } from './useAccountSync';

export interface VendorAccountData {
  id: string;
  name: string;
  email: string | null;
  business_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  role: string;
  created_at: string;
  updated_at?: string;
}

export function useVendorAccount() {
  const [accountData, setAccountData] = useState<VendorAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateAccountAndSync } = useAccountSync();

  // Fetch vendor account data
  const fetchAccountData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching vendor account data:', fetchError);
        setError(fetchError.message);
        toast({
          title: "Error",
          description: "Failed to load account information",
          variant: "destructive",
        });
      } else {
        setAccountData({
          ...data,
          address: '' // Add missing address field with default value
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching account data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load account information');
      toast({
        title: "Error",
        description: "Failed to load account information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update vendor account data
  const updateAccountData = async (updates: Partial<VendorAccountData>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      // Remove updated_at from updates since it might not exist in the database yet
      const { updated_at, ...updateData } = updates;

      console.log('🔍 Updating vendor account data:', { userId: user.id, updateData });

      // Use the sync function to update and broadcast changes
      const success = await updateAccountAndSync(updateData);

      if (!success) {
        setError('Failed to update account data');
        toast({
          title: "Error",
          description: "Failed to save changes",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setAccountData(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Success",
        description: "Account information updated successfully and synchronized across the app",
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected error updating account data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Fetch data on mount and when user changes
  useEffect(() => {
    fetchAccountData();
  }, [user?.id]);

  return {
    accountData,
    loading,
    saving,
    error,
    fetchAccountData,
    updateAccountData,
  };
} 