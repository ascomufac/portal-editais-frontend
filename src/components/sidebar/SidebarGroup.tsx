
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarGroupProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isCollapsed?: boolean;
  parentPath: string;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({ 
  title, 
  icon, 
  isActive, 
  isExpanded, 
  onToggle, 
  children,
  isCollapsed = false,
  parentPath
}) => {
  // Local state to track temporary expansion when sidebar is collapsed
  const [isTemporarilyExpanded, setIsTemporarilyExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleToggle = (e: React.MouseEvent) => {
    // In all cases, navigate to the parent path
    navigate(parentPath);
    
    // Only toggle the group expansion when sidebar is expanded (not collapsed)
    // And only when explicitly clicking on the accordion trigger
    if (!isCollapsed && (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-accordion-trigger="true"]'))) {
      onToggle();
    }
  };

  // Toggle temporary dropdown in collapsed mode
  const toggleTemporaryExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsTemporarilyExpanded(!isTemporarilyExpanded);
  };

  // Reset temporary expansion when isCollapsed changes
  useEffect(() => {
    if (!isCollapsed) {
      setIsTemporarilyExpanded(false);
    }
  }, [isCollapsed]);

  // For collapsed sidebar with tooltip
  if (isCollapsed) {
    const isLinkActive = location.pathname.startsWith(parentPath);
    
    return (
      <div className="space-y-1 relative">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => navigate(parentPath)}
                className={cn(
                  "sidebar-link w-full flex items-center justify-center px-2 py-2 text-sm font-medium rounded-md min-h-12 transition-all duration-200",
                  isLinkActive 
                    ? "text-ufac-blue bg-ufac-lightBlue" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div className="h-6 w-6 flex items-center justify-center">
                  {icon}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-white text-gray-800 border border-gray-200 shadow-md">
              <div className="flex items-center gap-2">
                <span>{title}</span>
                <button 
                  onClick={toggleTemporaryExpansion}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  aria-label="Show dropdown items"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Collapsed sidebar dropdown */}
        {isTemporarilyExpanded && (
          <div className="absolute left-16 top-0 bg-white shadow-md rounded-md py-2 min-w-48 z-50">
            <div className="font-medium text-sm px-4 py-2 text-gray-500 border-b mb-1">
              {title}
            </div>
            {children}
          </div>
        )}
      </div>
    );
  }

  // For expanded sidebar using Accordion with Material Design-style animations
  return (
    <Accordion
      type="single" 
      collapsible={true} // Make it collapsible
      value={isExpanded ? "item-1" : ""}
      className="space-y-1"
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger 
          data-accordion-trigger="true"
          className={cn(
            "sidebar-link w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md min-h-12 transition-all duration-200 [&[data-state=open]>svg]:rotate-180 hover:no-underline",
            isActive 
              ? "text-ufac-blue bg-ufac-lightBlue" 
              : "text-gray-700 hover:bg-gray-100"
          )}
          onClick={(e) => {
            // Prevent default to handle our own toggle logic
            e.preventDefault();
            
            // Navigate to parent path first
            navigate(parentPath);
            
            // Then handle toggling if click is on the arrow or trigger
            if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-accordion-trigger="true"]')) {
              onToggle();
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-5">
              {icon}
            </div>
            <span>{title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent 
          className="pl-6 space-y-1 pb-1 pt-1 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        >
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SidebarGroup;
