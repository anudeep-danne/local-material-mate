import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { FarmerSidebar } from './FarmerSidebar';

interface FarmerLayoutProps {
  children: ReactNode;
}

export function FarmerLayout({ children }: FarmerLayoutProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || role !== 'farmer') {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <FarmerSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}