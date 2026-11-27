'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  TOUR_QUERY_PARAM,
  TOUR_START_EVENT,
  tourSeenKey,
  type TourDefinition,
  type TourStartDetail,
  type TourStep,
} from './tourSteps';

type Rect = { top: number; left: number; width: number; height: number };

/** Folga do destaque em volta do elemento. */
const SPOT_PAD = 8;
/** Distância entre o destaque e o balão. */
const GAP = 12;
/** Margem mínima do balão até a borda da tela. */
const EDGE = 12;
/** Atraso antes de abrir sozinho no primeiro acesso (deixa a página assentar). */
const AUTO_START_DELAY_MS = 700;

const findTarget = (step: TourStep): HTMLElement | null => {
  if (!step.target) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? el : null;
};

const isAvailable = (step: TourStep) => !step.target || findTarget(step) !== null;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const markTourSeen = (tour: TourDefinition) => {
  try {
    localStorage.setItem(tourSeenKey(tour.id), tour.version);
  } catch {
    // modo privado / storage indisponível: o tour só não fica lembrado
  }
};

const hasSeenTour = (tour: TourDefinition) => {
  try {
    return localStorage.getItem(tourSeenKey(tour.id)) === tour.version;
  } catch {
    return true;
  }
};

interface ProductTourProps {
  tour: TourDefinition;
  /** Abre sozinho para quem ainda não viu esta versão do tour. */
  autoStart?: boolean;
  /**
   * Só abre sozinho quando `ready` for true (ex.: depois de a lista carregar),
   * para os passos que dependem do conteúdo não serem pulados.
   */
  ready?: boolean;
}

/**
 * Tour guiado: escurece a tela, recorta a área de cada passo e mostra um balão
 * com a explicação. Abre no primeiro acesso, por startTour(id) ou por
 * `?tour=<id>` na URL.
 */
const ProductTour: React.FC<ProductTourProps> = ({
  tour,
  autoStart = true,
  ready = true,
}) => {
  const { steps } = tour;
  const [activeSteps, setActiveSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [popSize, setPopSize] = useState({ width: 360, height: 200 });
  const popRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const open = activeSteps !== null;
  const openRef = useRef(false);
  openRef.current = open;
  const step = activeSteps?.[index];

  const start = useCallback(() => {
    if (openRef.current) return;
    const available = steps.filter(isAvailable);
    if (available.length === 0) return;
    setIndex(0);
    setActiveSteps(available);
  }, [steps]);

  const close = useCallback(() => {
    markTourSeen(tour);
    setActiveSteps(null);
    setRect(null);
  }, [tour]);

  // Pedido explícito: startTour(id) (botão de ajuda).
  useEffect(() => {
    const onStart = (event: Event) => {
      const { id } = (event as CustomEvent<TourStartDetail>).detail ?? {};
      if (id === tour.id) start();
    };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [tour.id, start]);

  // Abertura automática: ?tour=<id> na URL ou primeiro acesso.
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    let timer: number | undefined;

    if (params.get(TOUR_QUERY_PARAM) === tour.id) {
      params.delete(TOUR_QUERY_PARAM);
      const qs = params.toString();
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`
      );
      timer = window.setTimeout(start, AUTO_START_DELAY_MS);
    } else if (autoStart && !hasSeenTour(tour)) {
      timer = window.setTimeout(start, AUTO_START_DELAY_MS);
    }

    return () => window.clearTimeout(timer);
    // `start` muda junto com `tour`; reagir só a ready/autoStart/tour evita reabrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, autoStart, tour]);

  // Leva o alvo do passo para a área visível.
  useEffect(() => {
    if (!step) return;
    const el = findTarget(step);
    if (!el) return;
    const tall = el.getBoundingClientRect().height > window.innerHeight * 0.6;
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: tall ? 'start' : 'center',
    });
  }, [step]);

  // Acompanha posição/tamanho do alvo (rolagem, animações, redimensionamento).
  useEffect(() => {
    if (!step) return;
    let frame = 0;
    let prev = '';
    const tick = () => {
      const el = findTarget(step);
      let next: Rect | null = null;
      if (el) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // Recorta ao viewport: alvos altos (menu lateral, listas) não vazam da tela.
        const top = Math.max(r.top - SPOT_PAD, 4);
        const bottom = Math.min(r.bottom + SPOT_PAD, vh - 4);
        next = {
          top,
          left: r.left - SPOT_PAD,
          width: r.width + SPOT_PAD * 2,
          height: Math.max(bottom - top, 0),
        };
      }
      const key = next
        ? `${Math.round(next.top)},${Math.round(next.left)},${Math.round(next.width)},${Math.round(next.height)}`
        : 'none';
      if (key !== prev) {
        prev = key;
        setRect(next);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [step]);

  // Mede o balão para posicioná-lo sem sair da tela.
  useLayoutEffect(() => {
    if (!popRef.current) return;
    const { offsetWidth, offsetHeight } = popRef.current;
    setPopSize((s) =>
      s.width === offsetWidth && s.height === offsetHeight
        ? s
        : { width: offsetWidth, height: offsetHeight }
    );
  }, [step]);

  const goNext = useCallback(() => {
    if (!activeSteps) return;
    if (index >= activeSteps.length - 1) close();
    else setIndex((i) => i + 1);
  }, [activeSteps, index, close]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // Teclado: Esc fecha, setas navegam.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, goNext, goPrev]);

  useEffect(() => {
    if (open) primaryRef.current?.focus({ preventScroll: true });
  }, [open, index]);

  if (!open || !step || typeof document === 'undefined') return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { width: pw, height: ph } = popSize;
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  let popTop: number;
  let popLeft: number;
  // Cópia local: o ajuste abaixo não deve alterar o estado.
  const spot: Rect | null = rect ? { ...rect } : null;
  const sideRoom = spot ? vw - (spot.left + spot.width) >= pw + GAP + EDGE : false;
  if (spot && spot.height > vh * 0.6 && !sideRoom) {
    // Alvo alto sem espaço ao lado (ex.: lista de atualizações): mostra só o
    // começo dele, deixando lugar para o balão embaixo sem cobrir o destaque.
    const maxHeight = vh - EDGE - ph - GAP - spot.top;
    if (maxHeight >= 120) spot.height = Math.min(spot.height, maxHeight);
  }
  if (!spot) {
    popTop = (vh - ph) / 2;
    popLeft = (vw - pw) / 2;
  } else if (spot.height > vh * 0.6 && sideRoom) {
    // Alvo alto (ex.: menu lateral): balão ao lado.
    popLeft = spot.left + spot.width + GAP;
    popTop = clamp(spot.top + 24, EDGE, vh - ph - EDGE);
  } else {
    const below = spot.top + spot.height + GAP;
    const above = spot.top - GAP - ph;
    if (below + ph <= vh - EDGE) popTop = below;
    else if (above >= EDGE) popTop = above;
    else popTop = vh - ph - EDGE;
    popLeft = spot.left + spot.width / 2 - pw / 2;
  }
  popLeft = clamp(popLeft, EDGE, vw - pw - EDGE);
  popTop = clamp(popTop, EDGE, Math.max(vh - ph - EDGE, EDGE));

  const total = activeSteps!.length;
  const isLast = index === total - 1;

  return createPortal(
    <div className="fixed inset-0 z-[100]" aria-live="polite">
      {/* Bloqueia cliques na página durante o tour. */}
      <div className="absolute inset-0" />

      {spot ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl ring-2 ring-white/80 transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.62)',
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-slate-900/60" />
      )}

      <div
        ref={popRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="absolute w-[min(360px,calc(100vw-24px))] rounded-2xl bg-white p-5 shadow-2xl transition-[top,left] duration-300 ease-out motion-reduce:transition-none"
        style={{ top: popTop, left: popLeft }}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue"
          aria-label="Fechar tour"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-wide text-ufac-blue">
          {index === 0 && !step.target ? 'Novidades' : `Passo ${index + 1} de ${total}`}
        </p>
        <h2 id="tour-title" className="mt-1 pr-6 text-lg font-semibold text-slate-900">
          {step.title}
        </h2>
        <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {step.body}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden>
            {activeSteps!.map((s, i) => (
              <span
                key={`${s.target ?? 'intro'}-${i}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-ufac-blue' : 'w-1.5 bg-slate-200'
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {index === 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={close}>
                Pular
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={goPrev}>
                Voltar
              </Button>
            )}
            <Button
              ref={primaryRef}
              type="button"
              size="sm"
              onClick={goNext}
              className="bg-ufac-blue text-white hover:bg-ufac-blue/90"
            >
              {isLast ? 'Concluir' : index === 0 ? 'Começar' : 'Próximo'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductTour;
