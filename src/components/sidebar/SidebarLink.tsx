import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

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
  exactMatch = false
}) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if the current path matches this link's path
  // If exactMatch is true, we only consider it active if the paths match exactly
  // Otherwise, we consider it active if the current path starts with this link's path
  const isActive = exactMatch
    ? location.pathname === to
    : location.pathname === to || 
      (to !== '/' && location.pathname.startsWith(to));
  
  const handleClick = (e: React.MouseEvent) => {
    // Prevent default if we're directly handling navigation
    if (isCollapsed && !isMobile) {
      e.preventDefault();
      navigate(to); // Navigate directly without toggling sidebar
      if (onClick) onClick();
    } else {
      // For expanded sidebar or mobile, handle normally
      if (onClick) onClick();
      if (closeSidebar && isMobile) closeSidebar();
    }
  };
  
  const linkClasses = cn(
    "sidebar-link flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md min-h-12 hover:rounded-md transition-all duration-200",
    isActive ? "text-ufac-blue bg-ufac-lightBlue" : "text-gray-700 hover:bg-gray-100",
    isCollapsed && "justify-center px-2"
  );

  // When the sidebar is collapsed, wrap the link with a tooltip
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink 
              to={to} 
              className={linkClasses}
              onClick={handleClick}
            >
              <div className={cn("flex-shrink-0 w-5", isCollapsed && "h-6 w-6 flex items-center justify-center")}>
                {icon}
              </div>
              {!isCollapsed && <span>{children}</span>}
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-white text-gray-800 border border-gray-200 shadow-md">
            <p>{children}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Otherwise, return just the link
  return (
    <NavLink 
      to={to} 
      className={linkClasses}
      onClick={handleClick}
    >
      <div className={cn("flex-shrink-0 w-5", isCollapsed && "h-6 w-6 flex items-center justify-center")}>
        {icon}
      </div>
      {!isCollapsed && <span>{children}</span>}
    </NavLink>
  );
};

export default SidebarLink;
