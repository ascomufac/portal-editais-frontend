import { RefObject, useEffect, useRef } from 'react';

const MIN_SCALE = 0.3;
const MAX_SCALE = 3;

type PinchZoomOptions = {
  enabled?: boolean;
  min?: number;
  max?: number;
};

/**
 * Pinch-to-zoom por gestos de dois dedos no container do PDF.
 */
export function usePinchZoom(
  containerRef: RefObject<HTMLElement | null>,
  scale: number,
  onScaleChange: (scale: number) => void,
  options: PinchZoomOptions = {}
) {
  const { enabled = true, min = MIN_SCALE, max = MAX_SCALE } = options;
  const scaleRef = useRef(scale);
  const onScaleChangeRef = useRef(onScaleChange);
  const pinchRef = useRef<{ initialDistance: number; initialScale: number } | null>(
    null
  );
  const rafRef = useRef<number | null>(null);

  scaleRef.current = scale;
  onScaleChangeRef.current = onScaleChange;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const getDistance = (touches: TouchList) => {
      const [a, b] = [touches[0], touches[1]];
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        pinchRef.current = {
          initialDistance: Math.max(getDistance(event.touches), 1),
          initialScale: scaleRef.current,
        };
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !pinchRef.current) return;

      // Impede scroll/zoom nativo durante a pinça
      event.preventDefault();

      const ratio =
        getDistance(event.touches) / pinchRef.current.initialDistance;
      const next = Math.min(
        max,
        Math.max(min, pinchRef.current.initialScale * ratio)
      );

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        onScaleChangeRef.current(Number(next.toFixed(3)));
      });
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        pinchRef.current = null;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [containerRef, enabled, min, max]);
}
