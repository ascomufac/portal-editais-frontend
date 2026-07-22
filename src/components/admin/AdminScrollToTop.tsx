import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

type Props = {
  /** Elemento com overflow que recebe o scroll (ex.: `<main>` do admin). */
  scrollRef: React.RefObject<HTMLElement | null>;
  /** Pixels de scroll antes de mostrar o botão. */
  threshold?: number;
  className?: string;
};

/**
 * Botão flutuante para voltar ao topo do painel admin.
 */
const AdminScrollToTop: React.FC<Props> = ({
  scrollRef,
  threshold = 360,
  className,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const onScroll = () => {
      setVisible(scrollEl.scrollTop > threshold);
    };
    onScroll();
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [scrollRef, threshold]);

  const goTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollRef]);

  return (
    <Button
      type="button"
      size="icon"
      onClick={goTop}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className={cn(
        'fixed bottom-5 right-5 z-40 h-11 w-11 rounded-full bg-ufac-blue text-white shadow-lg transition-all hover:bg-ufac-blue/90 sm:bottom-8 sm:right-8',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
        className
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default AdminScrollToTop;
