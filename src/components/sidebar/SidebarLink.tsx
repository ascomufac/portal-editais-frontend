'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

/** Slot fixo para todos os ícones do menu (mesma escala visual) */
export const sidebarIconSlotClass =
  'flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden [&>svg]:h-full [&>svg]:w-full [&>svg]:max-h-full [&>svg]:max-w-full';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  closeSidebar?: () => void;
  isCollapsed?: boolean;
  exactMatch?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  children,
  onClick,
  closeSidebar,
  isCollapsed = false,
  exactMatch = false,
}) => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = exactMatch
    ? pathname === to
    : pathname === to || (to !== '/' && pathname.startsWith(to));

  const handleClick = (e: React.MouseEvent) => {
    if (isCollapsed && !isMobile) {
      e.preventDefault();
      router.push(to);
      onClick?.();
    } else {
      onClick?.();
      if (closeSidebar && isMobile) closeSidebar();
    }
  };

  const linkClasses = cn(
    'sidebar-link flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:rounded-md',
    isActive ? 'bg-ufac-lightBlue text-ufac-blue' : 'text-gray-700 hover:bg-gray-100',
    isCollapsed && 'justify-center px-2'
  );

  const iconSlot = (
    <div className={cn(sidebarIconSlotClass, isCollapsed && 'h-6 w-6')}>{icon}</div>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={to} className={linkClasses} onClick={handleClick}>
              {iconSlot}
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="border border-gray-200 bg-white text-gray-800 shadow-md"
          >
            <p>{children}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link href={to} className={linkClasses} onClick={handleClick}>
      {iconSlot}
      <span>{children}</span>
    </Link>
  );
};

export default SidebarLink;
