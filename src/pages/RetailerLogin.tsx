import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';
import { useToast } from '@/hooks/use-toast';

export default function RetailerLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: insertError } = await supabase.from('users').insert({
            id: authData.user.id,
            email,
            name: email.split('@')[0],
            role: 'retailer'
          });

          if (insertError) throw insertError;

          toast({
            title: "Account created!",
            description: "Your retailer account has been created successfully.",
          });
          setMode('login');
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', authData.user.id)
            .single();

          if (userError) throw userError;

          if (userData.role === 'retailer') {
            navigate('/retailer/dashboard');
            toast({
              title: "Welcome back!",
              description: "Successfully logged in as retailer.",
            });
          } else {
            throw new Error('Access denied. This account is not registered as a retailer.');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: mode === 'signup' ? "Signup Failed" : "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Retailer Login' : 'Create Retailer Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' ? 'Sign in to your retailer account' : 'Create a new retailer account'}
          </p>
        </div>
        <AuthForm 
          mode={mode}
          onSubmit={handleSubmit}
          loading={loading}
          role="retailer"
        />
        <div className="text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-primary hover:text-primary/80"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}