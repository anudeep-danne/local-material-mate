import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      console.log('🔍 useAuth: Starting session check...');
      setLoading(true);
      setError(null);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔍 useAuth: Session check result:', { session: !!session, error: sessionError });
        
        if (sessionError) {
          console.error('❌ useAuth: Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ useAuth: User found:', session.user.id);
          setUser(session.user);
          
          // Fetch role
          const { data, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          console.log('🔍 useAuth: Role fetch result:', { data, error: userError });
          
          if (userError) {
            console.error('❌ useAuth: Role fetch error:', userError);
            setError(`Failed to fetch user role: ${userError.message}`);
          } else if (data) {
            console.log('✅ useAuth: Role set:', data.role);
            setRole(data.role);
          } else {
            console.warn('⚠️ useAuth: No role data found for user');
            setError('User role not found in database');
          }
        } else {
          console.log('ℹ️ useAuth: No session found');
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('❌ useAuth: Unexpected error:', err);
        setError(err instanceof Error ? err.message : 'Unexpected error occurred');
      } finally {
        setLoading(false);
        console.log('🔍 useAuth: Loading finished. State:', { user: !!user, role, loading: false, error });
      }
    };
    
    getSession();
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 useAuth: Auth state changed:', event, !!session);
      getSession();
    });
    
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔍 useAuth: Attempting login for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('❌ useAuth: Login error:', error);
        setError(error.message);
      } else {
        console.log('✅ useAuth: Login successful:', user?.id);
      }
      setLoading(false);
      return { user, error };
    } catch (err) {
      console.error('❌ useAuth: Login unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
      return { user: null, error: err instanceof Error ? err : new Error('Login failed') };
    }
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    console.log('🔍 useAuth: Attempting signup for:', email, 'role:', role);
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user }, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('❌ useAuth: Signup error:', error);
        setError(error.message);
        setLoading(false);
        return { user: null, error };
      }
      
      if (user) {
        console.log('✅ useAuth: User created, inserting into users table:', user.id);
        const { error: insertError } = await supabase.from('users').insert({ 
          id: user.id, 
          email, 
          name, 
          role 
        });
        
        if (insertError) {
          console.error('❌ useAuth: Insert error:', insertError);
          setError(insertError.message);
        } else {
          console.log('✅ useAuth: User inserted into users table successfully');
        }
      }
      
      setLoading(false);
      return { user, error: null };
    } catch (err) {
      console.error('❌ useAuth: Signup unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Signup failed');
      setLoading(false);
      return { user: null, error: err instanceof Error ? err : new Error('Signup failed') };
    }
  };

  const logout = async () => {
    console.log('🔍 useAuth: Logging out...');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setError(null);
      console.log('✅ useAuth: Logout successful');
      // Navigation will be handled by the component calling logout
    } catch (err) {
      console.error('❌ useAuth: Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  return { user, role, loading, error, login, signup, logout };
} 