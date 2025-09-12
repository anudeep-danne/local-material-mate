import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function DistributorLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string, name?: string) => {
    if (isLogin) {
      const result = await login(email, password);
      if (result.user && !result.error) {
        navigate('/distributor/dashboard');
      }
    } else {
      if (!name) return;
      const result = await signup(email, password, name, 'distributor');
      if (result.user && !result.error) {
        navigate('/distributor/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">RawMate Distributor</CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your distributor account' : 'Create your distributor account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            isLogin={isLogin}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}