'use client';

import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { HOME_TOUR, TOUR_QUERY_PARAM, startTour } from './tourSteps';

/** Reabre o tour; fora da página inicial, vai até ela e abre lá. */
const TourButton: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = () => {
    if (pathname === '/') startTour(HOME_TOUR.id);
    else router.push(`/?${TOUR_QUERY_PARAM}=${HOME_TOUR.id}`);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      data-tour="tour-button"
      title="Conhecer o portal"
      aria-label="Conhecer o portal (tour guiado)"
      className="shrink-0 text-white hover:bg-white/10 hover:text-white"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  );
};

export default TourButton;
