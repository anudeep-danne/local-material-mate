import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FarmerSidebar } from './FarmerSidebar';

interface FarmerLayoutProps {
  children: ReactNode;
}

export function FarmerLayout({ children }: FarmerLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <FarmerSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}