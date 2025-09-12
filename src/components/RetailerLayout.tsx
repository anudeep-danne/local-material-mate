import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { RetailerSidebar } from './RetailerSidebar';

interface RetailerLayoutProps {
  children: ReactNode;
}

export function RetailerLayout({ children }: RetailerLayoutProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || role !== 'retailer') {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <RetailerSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}