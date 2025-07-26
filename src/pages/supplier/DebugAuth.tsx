import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const DebugAuth = () => {
  const { user, role, loading, error } = useAuth();

  useEffect(() => {
    console.log('🔍 DebugAuth: Current state:', {
      user: user ? { id: user.id, email: user.email } : null,
      role,
      loading,
      error
    });
  }, [user, role, loading, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">Authentication Debug</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Loading State:</h3>
            <p className="text-sm">{loading ? '⏳ Loading...' : '✅ Loaded'}</p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">User:</h3>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {user ? JSON.stringify(user, null, 2) : 'null'}
            </pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Role:</h3>
            <p className="text-sm">{role || 'undefined'}</p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Error:</h3>
            <p className="text-sm text-destructive">{error || 'none'}</p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">User ID:</h3>
            <p className="text-sm font-mono">{user?.id || 'undefined'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth; 