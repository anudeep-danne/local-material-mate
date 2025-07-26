import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAccountSync() {
  const { user } = useAuth();

  // Function to refresh account data across the app
  const refreshAccountData = async () => {
    if (!user?.id) return;

    try {
      // Fetch updated user data
      const { data: updatedUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing account data:', error);
        return;
      }

      // Broadcast account update event
      window.dispatchEvent(new CustomEvent('accountUpdated', {
        detail: { userId: user.id, userData: updatedUser }
      }));

      // If this is a supplier, also broadcast supplier-specific update
      if (updatedUser.role === 'supplier') {
        window.dispatchEvent(new CustomEvent('supplierUpdated', {
          detail: { userId: user.id, userData: updatedUser }
        }));
        console.log('🔄 Supplier update broadcasted');
      }

      console.log('✅ Account data refreshed and broadcasted');
    } catch (err) {
      console.error('Error in account sync:', err);
    }
  };

  // Function to update account information and refresh across app
  const updateAccountAndSync = async (updates: any) => {
    if (!user?.id) return false;

    try {
      // Update the account
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating account:', updateError);
        return false;
      }

      // Refresh and broadcast the update
      await refreshAccountData();
      return true;
    } catch (err) {
      console.error('Error in updateAccountAndSync:', err);
      return false;
    }
  };

  // Listen for account updates from other parts of the app
  useEffect(() => {
    const handleAccountUpdate = (event: CustomEvent) => {
      console.log('🔄 Account update received:', event.detail);
      // You can add additional logic here to handle the update
    };

    window.addEventListener('accountUpdated', handleAccountUpdate as EventListener);

    return () => {
      window.removeEventListener('accountUpdated', handleAccountUpdate as EventListener);
    };
  }, []);

  return {
    refreshAccountData,
    updateAccountAndSync
  };
} 