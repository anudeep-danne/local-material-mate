import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DistributorSidebar } from './DistributorSidebar';

interface DistributorLayoutProps {
  children: ReactNode;
}

export function DistributorLayout({ children }: DistributorLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DistributorSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}