import { RefObject, useEffect, useRef, useState } from 'react';

/**
 * Esconde a toolbar ao rolar para baixo; mostra assim que o gesto/scroll sobe.
 * Escuta container + window + touch + wheel para cobrir mobile/DevTools.
 */
export function useScrollToolbar(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true
) {
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);
  const lastY = useRef(0);
  const touchLastY = useRef<number | null>(null);

  const setVis = (next: boolean) => {
    if (visibleRef.current === next) return;
    visibleRef.current = next;
    setVisible(next);
  };

  useEffect(() => {
    if (!enabled) {
      setVis(true);
      return;
    }

    const readTop = () => {
      const el = containerRef.current;
      if (el && el.scrollHeight > el.clientHeight + 2) {
        return el.scrollTop;
      }
      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    lastY.current = readTop();

    const onScrollFrom = (top: number) => {
      const delta = top - lastY.current;
      lastY.current = top;

      if (top <= 4) {
        setVis(true);
        return;
      }

      // Qualquer movimento para cima (delta negativo) → mostrar
      if (delta < -1) setVis(true);
      // Movimento para baixo → esconder
      else if (delta > 2) setVis(false);
    };

    const onContainerScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      onScrollFrom(el.scrollTop);
    };

    const onWindowScroll = () => {
      onScrollFrom(window.scrollY || document.documentElement.scrollTop || 0);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < -1) setVis(true);
      else if (e.deltaY > 2) setVis(false);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchLastY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || touchLastY.current == null) return;
      const y = e.touches[0].clientY;
      const dy = y - touchLastY.current; // dedo para baixo → dy > 0 → scroll sobe
      touchLastY.current = y;

      if (dy > 2) setVis(true); // arrastando conteúdo para baixo = voltando
      else if (dy < -2) setVis(false); // arrastando para cima = avançando
    };

    const onTouchEnd = () => {
      touchLastY.current = null;
    };

    const opts: AddEventListenerOptions = { passive: true };
    const el = containerRef.current;

    el?.addEventListener('scroll', onContainerScroll, opts);
    window.addEventListener('scroll', onWindowScroll, opts);
    window.addEventListener('wheel', onWheel, opts);
    window.addEventListener('touchstart', onTouchStart, opts);
    window.addEventListener('touchmove', onTouchMove, opts);
    window.addEventListener('touchend', onTouchEnd, opts);
    window.addEventListener('touchcancel', onTouchEnd, opts);

    // Reanexa no container quando o PDF terminar de montar
    const retry = window.setTimeout(() => {
      const next = containerRef.current;
      if (next && next !== el) {
        el?.removeEventListener('scroll', onContainerScroll);
        next.addEventListener('scroll', onContainerScroll, opts);
        lastY.current = next.scrollTop;
      }
    }, 500);

    return () => {
      window.clearTimeout(retry);
      el?.removeEventListener('scroll', onContainerScroll);
      containerRef.current?.removeEventListener('scroll', onContainerScroll);
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [containerRef, enabled]);

  return visible;
}
