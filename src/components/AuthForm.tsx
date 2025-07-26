import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthFormProps {
  role: 'vendor' | 'supplier';
}

const AuthForm = ({ role }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        // Login
        const { data: { user, session }, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError || !user) throw loginError || new Error('Login failed');
        // Fetch user role
        const { data, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (userError || !data) throw userError || new Error('User not found');
        if (data.role !== role) {
          setError(`You are not registered as a ${role}`);
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        // Redirect
        navigate(role === 'vendor' ? '/vendor/dashboard' : '/supplier/dashboard');
      } else {
        // Signup (no email confirmation)
        // 1. Sign up user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: null }, // disables confirmation email
        });
        if (signUpError || !signUpData.user) throw signUpError || new Error('Signup failed');
        // 2. Insert into users table
        const { error: insertError } = await supabase.from('users').insert({
          id: signUpData.user.id,
          name,
          email,
          role,
        });
        if (insertError) throw insertError;
        // 3. Sign in immediately (in case session is not set)
        let user = signUpData.user;
        let session = signUpData.session;
        if (!session) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (loginError || !loginData.user) throw loginError || new Error('Login after signup failed');
          user = loginData.user;
          session = loginData.session;
        }
        // 4. Redirect
        navigate(role === 'vendor' ? '/vendor/dashboard' : '/supplier/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}` : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</h2>
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <Input
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              id="rememberMe"
            />
            <label htmlFor="rememberMe" className="text-sm">Remember Me</label>
            <a
              href="#"
              className="ml-auto text-xs text-vendor-primary hover:underline"
              onClick={e => {
                e.preventDefault();
                supabase.auth.resetPasswordForEmail(email).then(({ error }) => {
                  if (error) setError(error.message);
                  else setError('Password reset email sent!');
                });
              }}
            >
              Forgot Password?
            </a>
          </div>
          {error && <div className="text-destructive text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full text-lg py-3" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center">
          {isLogin ? (
            <>
              Don’t have an account?{' '}
              <button className="text-vendor-primary hover:underline" onClick={() => setIsLogin(false)}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-vendor-primary hover:underline" onClick={() => setIsLogin(true)}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 