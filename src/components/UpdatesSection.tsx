'use client';

import { motion } from 'framer-motion';
import { CalendarClock, Loader2, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface Update {
  id: string;
  title: string;
  /** Data/hora ISO (modificação ou criação). */
  dateISO: string;
  /** Etiqueta do setor (ex.: Prograd). */
  setor?: string;
  /** Tipo do item (Pasta, Arquivo…). */
  typeLabel?: string;
  href?: string;
}

interface UpdatesSectionProps {
  updates: Update[];
  isLoading?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Rótulo do período ativo (ex.: "Hoje"); ausente = sem filtro. */
  periodLabel?: string;
  onClearPeriod?: () => void;
}

/** Fuso do Acre: igual no servidor e no navegador, sem divergência na hidratação. */
const TZ = 'America/Rio_Branco';

const dayKey = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: TZ });

const dayLabel = (date: Date) =>
  date.toLocaleDateString('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const timeLabel = (date: Date) =>
  date.toLocaleTimeString('pt-BR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });

type Group = { key: string; label: string; items: Update[] };

const UpdatesSection: React.FC<UpdatesSectionProps> = ({
  updates,
  isLoading = false,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  periodLabel,
  onClearPeriod,
}) => {
  // "Hoje"/"Ontem" só depois de montar: a página é cacheada por 1 dia no servidor.
  const [today, setToday] = useState<{ today: string; yesterday: string } | null>(
    null
  );

  useEffect(() => {
    const now = Date.now();
    setToday({
      today: dayKey(new Date(now)),
      yesterday: dayKey(new Date(now - 24 * 60 * 60 * 1000)),
    });
  }, []);

  const groups = useMemo<Group[]>(() => {
    const result: Group[] = [];
    for (const update of updates) {
      const date = new Date(update.dateISO);
      const valid = !Number.isNaN(date.getTime());
      const key = valid ? dayKey(date) : 'sem-data';
      let group = result.find((g) => g.key === key);
      if (!group) {
        let label = valid ? dayLabel(date) : 'Sem data';
        if (valid && today?.today === key) label = `Hoje · ${label}`;
        else if (valid && today?.yesterday === key) label = `Ontem · ${label}`;
        group = { key, label, items: [] };
        result.push(group);
      }
      group.items.push(update);
    }
    return result;
  }, [updates, today]);

  return (
    <section id="atualizacoes" aria-labelledby="home-updates-title" className="scroll-mt-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2
          id="home-updates-title"
          className="text-lg font-semibold text-gray-900 sm:text-xl"
        >
          Atualizações
        </h2>
        {periodLabel && (
          <button
            type="button"
            onClick={onClearPeriod}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-ufac-lightBlue px-3 text-sm font-medium text-ufac-blue hover:bg-ufac-lightBlue/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue"
            aria-label={`Remover filtro de período: ${periodLabel}`}
          >
            {periodLabel}
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-6 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando atualizações...
          </div>
        ) : updates.length === 0 ? (
          <div className="p-6 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-gray-600">
              {periodLabel
                ? 'Nenhuma atualização neste período'
                : 'Nenhuma atualização recente'}
            </p>
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <div key={group.key}>
                <h3 className="border-t border-gray-100 bg-slate-50 px-4 py-2 text-xs font-bold tracking-wide text-slate-600 first:border-t-0">
                  {group.label}
                </h3>
                <ul className="divide-y divide-gray-100">
                  {group.items.map((update, index) => {
                    const date = new Date(update.dateISO);
                    const time = Number.isNaN(date.getTime()) ? '' : timeLabel(date);
                    const content = (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index, 8) * 0.03 }}
                        className="cursor-pointer px-4 py-3 hover:bg-gray-50"
                      >
                        <p
                          className="line-clamp-3 text-sm font-medium text-gray-900"
                          title={update.title}
                        >
                          {update.title}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                          {update.setor && (
                            <span className="rounded-full bg-ufac-lightBlue px-2.5 py-0.5 font-semibold text-ufac-blue">
                              {update.setor}
                            </span>
                          )}
                          {update.typeLabel && <span>{update.typeLabel}</span>}
                          {update.typeLabel && time && <span aria-hidden>·</span>}
                          {time && <span>{time}</span>}
                        </div>
                      </motion.div>
                    );

                    return (
                      <li key={update.id}>
                        {update.href ? (
                          <Link href={update.href} className="block">
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {hasMore && onLoadMore && (
              <div className="flex justify-center border-t border-gray-100 p-3">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 rounded-full border-ufac-blue px-7 text-ufac-blue hover:bg-ufac-lightBlue hover:text-ufac-blue"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Ver mais atualizações'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpdatesSection;
