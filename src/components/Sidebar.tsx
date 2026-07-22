
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import React from 'react';
import SidebarContent from './sidebar/SidebarContent';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  closeSidebar, 
  isCollapsed, 
  toggleCollapsed 
}) => {
  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const isMobile = useIsMobile();
  
  // Prevent sidebar from expanding on route changes
  // This is handled by the parent component (MainLayout) now
  
  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            key="sidebar"
            initial={{ x: isMobile ? '-100%' : 0 }}
            animate="open"
            exit="closed"
            variants={isMobile ? sidebarVariants : {}}
            className={cn(
              'fixed top-14 sm:top-16 bottom-0 left-0 z-[46] flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out',
              isMobile
                ? 'w-[min(85vw,300px)] pb-[env(safe-area-inset-bottom)]'
                : isCollapsed
                  ? 'w-16'
                  : 'w-80'
            )}
          >
            {!isMobile && (
              <button
                onClick={toggleCollapsed}
                className="absolute -right-4 top-4 z-50 hidden rounded-full bg-white p-1 shadow-md hover:bg-gray-50 md:flex"
                aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen size={18} className="text-ufac-blue" />
                ) : (
                  <PanelRightOpen size={18} className="text-ufac-blue" />
                )}
              </button>
            )}

            <SidebarContent
              closeSidebar={closeSidebar}
              isCollapsed={!isMobile && isCollapsed}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
