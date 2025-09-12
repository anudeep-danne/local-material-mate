import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ConsumerSidebar } from './ConsumerSidebar';

interface ConsumerLayoutProps {
  children: ReactNode;
}

export function ConsumerLayout({ children }: ConsumerLayoutProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || role !== 'consumer') {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <ConsumerSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}