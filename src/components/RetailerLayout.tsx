import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { RetailerSidebar } from './RetailerSidebar';

interface RetailerLayoutProps {
  children: ReactNode;
}

export function RetailerLayout({ children }: RetailerLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RetailerSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}