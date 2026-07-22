'use client';

import AuthMenu from '@/components/auth/AuthMenu';
import UfacEditaisLogo from '@/components/brand/UfacEditaisLogo';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn, getSidebarCollapsedState, toggleSidebarCookie } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    setIsSidebarCollapsed(getSidebarCollapsedState());
    setIsSidebarOpen(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile, isSidebarOpen]);

  const toggleCollapsed = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    toggleSidebarCookie(newState);
  };

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  const closeSidebar = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <div className="fixed inset-x-0 top-0 z-50">
        <header className="relative flex h-14 items-center gap-2 bg-ufac-blue px-2 sm:h-16 sm:gap-3 sm:px-6">
          {mobileSearchOpen && isMobile ? (
            <div className="flex w-full items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSearchOpen(false)}
                className="shrink-0 text-white hover:bg-white/10 hover:text-white"
                aria-label="Fechar busca"
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <SearchBar
                  compact
                  autoFocus
                  onRequestClose={() => setMobileSearchOpen(false)}
                />
              </div>
            </div>
          ) : (
            <>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="shrink-0 text-white hover:bg-white/10 hover:text-white"
                  aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              <Link href="/" className="shrink-0" aria-label="Página inicial">
                <UfacEditaisLogo
                  variant="onDark"
                  className="h-5 w-auto max-w-[110px] sm:h-6 sm:max-w-none"
                />
              </Link>

              {isMobile ? (
                <div className="ml-auto flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileSearchOpen(true)}
                    className="text-white hover:bg-white/10 hover:text-white"
                    aria-label="Pesquisar edital"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <AuthMenu />
                </div>
              ) : (
                <>
                  <div className="flex min-w-0 flex-1 justify-end px-2 sm:px-4 md:justify-center">
                    <SearchBar compact />
                  </div>
                  <AuthMenu />
                </>
              )}
            </>
          )}
        </header>
      </div>

      <div className="flex min-h-0 flex-1 pt-14 sm:pt-16">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
          isCollapsed={isSidebarCollapsed}
          toggleCollapsed={toggleCollapsed}
        />

        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out',
            !isMobile && isSidebarOpen
              ? isSidebarCollapsed
                ? 'ml-16'
                : 'ml-80'
              : 'ml-0'
          )}
        >
          <main
            className={cn(
              'min-h-0 flex-1',
              className
                ? className
                : 'overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 md:p-8'
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
