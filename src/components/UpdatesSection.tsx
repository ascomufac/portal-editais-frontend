import { motion } from 'framer-motion';
import { CalendarClock, Loader2 } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Update {
  id: string;
  title: string;
  date: string;
  description: string;
  href?: string;
}

interface UpdatesSectionProps {
  updates: Update[];
  isLoading?: boolean;
  /** Lista mais densa, para caber na home sem scroll da página */
  compact?: boolean;
  className?: string;
}

const UpdatesSection: React.FC<UpdatesSectionProps> = ({
  updates,
  isLoading = false,
  compact = false,
  className,
}) => {
  return (
    <section className={cn(compact ? 'flex min-h-0 flex-1 flex-col' : 'mt-8', className)}>
      <div className={cn('flex items-center', compact ? 'mb-2 shrink-0' : 'mb-4')}>
        <h2 className={cn('font-semibold text-gray-900', compact ? 'text-lg' : 'text-xl')}>
          Atualizações
        </h2>
      </div>

      <div
        className={cn(
          'bg-white shadow-sm border border-gray-100 overflow-hidden',
          compact
            ? 'flex min-h-0 flex-1 flex-col rounded-2xl p-1.5'
            : 'rounded-[32px] p-3'
        )}
      >
        {isLoading ? (
          <div className="p-6 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando atualizações...
          </div>
        ) : updates.length === 0 ? (
          <div className="p-6 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-gray-600">Nenhuma atualização recente</p>
          </div>
        ) : (
          <div
            className={cn(
              'divide-y divide-gray-100',
              compact && 'min-h-0 flex-1 overflow-y-auto no-scrollbar'
            )}
          >
            {updates.map((update, index) => {
              const content = (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    'hover:bg-gray-50 cursor-pointer',
                    compact ? 'px-3 py-2.5' : 'p-4'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h3
                        className={cn(
                          'font-medium text-gray-900',
                          compact ? 'line-clamp-1 text-sm' : 'text-sm'
                        )}
                      >
                        {update.title}
                      </h3>
                      <div
                        className={cn(
                          'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500',
                          compact ? 'mt-0.5' : 'mt-1'
                        )}
                      >
                        <span>{update.date}</span>
                        {update.description && (
                          <>
                            <span aria-hidden>•</span>
                            <span className="truncate">{update.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );

              return update.href ? (
                <Link key={update.id} href={update.href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={update.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpdatesSection;
