import { RefObject, useEffect, useRef, useState } from 'react';

const DELTA = 8;

/**
 * Mostra a toolbar ao rolar para cima; esconde ao rolar para baixo.
 */
export function useScrollToolbar(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true
) {
  const [visible, setVisible] = useState(true);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    lastScrollTop.current = el.scrollTop;

    const onScroll = () => {
      const top = el.scrollTop;
      const delta = top - lastScrollTop.current;

      if (top <= 12) {
        setVisible(true);
      } else if (delta > DELTA) {
        setVisible(false);
      } else if (delta < -DELTA) {
        setVisible(true);
      }

      lastScrollTop.current = top <= 0 ? 0 : top;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef, enabled]);

  return visible;
}
