'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppProvider } from '@/context/AppContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopBar } from '@/components/layout/AppTopBar';

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Auth pages render without dashboard sidebar
  const isAuthPage = pathname === '/login' || pathname === '/forgot-password';

  if (isAuthPage) {
    return <AppProvider>{children}</AppProvider>;
  }

  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#0c0e12]">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col h-full">
          <AppSidebar />
        </div>

        {/* Mobile Navigation Drawer Backdrop & Modal */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#0c0e12] shadow-2xl z-10">
              <AppSidebar onCloseMobile={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AppTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
