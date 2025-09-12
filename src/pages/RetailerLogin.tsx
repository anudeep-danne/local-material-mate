import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';
import { useToast } from '@/hooks/use-toast';

export default function RetailerLogin() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Retailer Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your retailer account
          </p>
        </div>
        <AuthForm 
          mode="login"
          onSubmit={handleLogin}
          loading={loading}
          role="retailer"
        />
      </div>
    </div>
  );
}