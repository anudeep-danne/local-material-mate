import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DistributorSidebar } from './DistributorSidebar';

interface DistributorLayoutProps {
  children: ReactNode;
}

export function DistributorLayout({ children }: DistributorLayoutProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || role !== 'distributor') {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <DistributorSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}