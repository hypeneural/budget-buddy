import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  headerActions?: ReactNode;
}

export function AppLayout({ children, title, headerActions }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        {title && (
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-soft-sm md:px-6">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {headerActions && (
              <div className="flex items-center gap-2">{headerActions}</div>
            )}
          </header>
        )}

        {/* Page Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'pb-20 md:pb-6', // Bottom padding for mobile nav
          )}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
