import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type SupplierProfile = Database['public']['Tables']['users']['Row'];

export const useSupplierProfile = () => {
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);

  const getCurrentUser = async () => {
    try {
      console.log('🔍 Getting current user...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No authenticated user');
      
      console.log('✅ User found:', user.id);
      
      // Verify user is a supplier
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;
      if (userData.role !== 'supplier') {
        throw new Error('User is not a supplier');
      }
      
      console.log('✅ User is a supplier');
      setSupplierId(user.id);
      return user.id;
    } catch (err) {
      console.error('❌ Error getting current user:', err);
      setError(err instanceof Error ? err.message : 'Failed to get current user');
      setLoading(false);
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const currentUserId = await getCurrentUser();
      if (!currentUserId) return;

      console.log('🔍 Fetching profile for user:', currentUserId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUserId)
        .eq('role', 'supplier')
        .single();

      if (error) throw error;
      console.log('✅ Profile fetched:', data);
      setProfile(data);
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testDatabasePermissions = async () => {
    try {
      const currentUserId = await getCurrentUser();
      if (!currentUserId) return false;

      console.log('🧪 Testing database permissions...');
      
      // Test read permission
      const { data: readTest, error: readError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', currentUserId)
        .single();
      
      if (readError) {
        console.error('❌ Read permission test failed:', readError);
        return false;
      }
      
      console.log('✅ Read permission test passed:', readTest);
      
      // Test update permission with minimal change
      const { error: updateError } = await supabase
        .from('users')
        .update({ description: 'Test update' })
        .eq('id', currentUserId);
      
      if (updateError) {
        console.error('❌ Update permission test failed:', updateError);
        return false;
      }
      
      console.log('✅ Update permission test passed');
      
      // Revert the test change
      await supabase
        .from('users')
        .update({ description: profile?.description || null })
        .eq('id', currentUserId);
      
      return true;
    } catch (err) {
      console.error('❌ Database permission test failed:', err);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<SupplierProfile>) => {
    try {
      // Always get the current user ID to ensure we have the latest
      const currentUserId = await getCurrentUser();
      if (!currentUserId) {
        toast.error('Failed to get current user');
        return false;
      }

      console.log('🔍 Updating profile for user:', currentUserId);
      console.log('📝 Updates:', updates);

      // Test database permissions first
      const permissionsOk = await testDatabasePermissions();
      if (!permissionsOk) {
        toast.error('Database permissions test failed');
        return false;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUserId)
        .select();

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }
      
      console.log('✅ Profile updated successfully:', data);
      toast.success('Profile updated successfully');
      await fetchProfile(); // Refresh the profile data
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      console.error('❌ Profile update error:', err);
      setError(message);
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};