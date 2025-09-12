import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';
import { useToast } from '@/hooks/use-toast';

export default function ConsumerLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
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

        if (userData.role === 'consumer') {
          navigate('/consumer/home');
          toast({
            title: "Welcome back!",
            description: "Successfully logged in as consumer.",
          });
        } else {
          throw new Error('Access denied. This account is not registered as a consumer.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Consumer Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your consumer account
          </p>
        </div>
        <AuthForm 
          mode="login"
          onSubmit={handleLogin}
          loading={loading}
          role="consumer"
        />
      </div>
    </div>
  );
}