'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Star } from 'lucide-react';
import {
  UPDATES_PERIOD_LABELS,
  type UpdatesPeriod,
} from '@/lib/updates';

const SHORTCUT_PERIODS: UpdatesPeriod[] = ['today', 'week', 'month'];

const chipClass =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/60 px-4 text-sm font-medium text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white';

interface HomeHeroProps {
  activePeriod: UpdatesPeriod;
  onPeriodChange: (period: UpdatesPeriod) => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ activePeriod, onPeriodChange }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    router.push(`/resultados-busca?q=${encodeURIComponent(term)}&section=all`);
  };

  return (
    <section
      aria-labelledby="home-hero-title"
      className="flex flex-col gap-4 rounded-3xl bg-ufac-blue px-5 py-6 text-white sm:px-8 sm:py-8"
    >
      <div>
        <h1 id="home-hero-title" className="text-2xl font-bold sm:text-3xl">
          Encontre editais da Ufac
        </h1>
        <p className="mt-1 text-sm text-blue-100 sm:text-base">
          Pesquise por número, curso, setor ou palavra-chave.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row" role="search">
        <label htmlFor="home-search" className="sr-only">
          Pesquisar editais
        </label>
        <div className="flex h-14 min-w-0 items-center gap-3 rounded-full bg-white px-5 text-slate-500 sm:flex-1">
          <Search className="h-5 w-5 shrink-0" aria-hidden />
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Edital, curso, setor ou palavra-chave"
            className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
          />
        </div>
        <button
          type="submit"
          className="h-14 rounded-full bg-slate-900 px-8 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-sm font-medium text-blue-100">Atalhos:</span>
        {SHORTCUT_PERIODS.map((period) => (
          <button
            key={period}
            type="button"
            aria-pressed={activePeriod === period}
            onClick={() => onPeriodChange(activePeriod === period ? 'all' : period)}
            className={`${chipClass} ${
              activePeriod === period ? 'bg-white !text-ufac-blue hover:bg-white' : ''
            }`}
          >
            {UPDATES_PERIOD_LABELS[period]}
          </button>
        ))}
        <Link href="/favoritos" className={chipClass}>
          <Star className="h-4 w-4" aria-hidden />
          Meus favoritos
        </Link>
      </div>
    </section>
  );
};

export default HomeHero;
