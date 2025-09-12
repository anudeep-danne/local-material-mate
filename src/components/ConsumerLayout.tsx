import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ConsumerSidebar } from './ConsumerSidebar';

interface ConsumerLayoutProps {
  children: ReactNode;
}

export function ConsumerLayout({ children }: ConsumerLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ConsumerSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}