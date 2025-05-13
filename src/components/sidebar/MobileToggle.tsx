
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, PanelLeftClose, PanelRightClose } from 'lucide-react';
import React from 'react';

interface MobileToggleProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ isOpen, toggleSidebar }) => {
  const isMobile = useIsMobile();
  
  // When the sidebar is open, show the collapse button with an arrow pointing left
  if (isOpen) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="text-ufac-blue"
        aria-label="Fechar menu"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    );
  }
  
  // When sidebar is closed, show the expand button with an arrow pointing right
  // Different positioning for mobile vs desktop
  if (isMobile) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 left-0 z-40 lg:hidden bg-ufac-blue text-white p-3 rounded-r-md shadow-lg"
        aria-label="Abrir menu"
      >
        <PanelRightClose className="h-5 w-5" />
      </button>
    );
  }
  
  // For desktop, position the button in the top corner
  return (
    <button
      onClick={toggleSidebar}
      className="fixed bottom-6 left-6 z-40 bg-ufac-blue text-white p-3 rounded-full shadow-lg"
      aria-label="Abrir menu"
    >
      <PanelLeftClose className="h-5 w-5" />
    </button>
  );
};

export default MobileToggle;
