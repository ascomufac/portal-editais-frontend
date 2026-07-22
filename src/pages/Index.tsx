import React, { useEffect, useMemo, useState } from 'react';
import EditalCard from '@/components/EditalCard';
import UpdatesSection, { Update } from '@/components/UpdatesSection';
import MainLayout from '@/layouts/MainLayout';
import {
  fetchFeaturedEditais,
  fetchRecentUpdates,
  toEditalHref,
  type EditalItem,
} from '@/services/editalService';
import { motion } from 'framer-motion';
import { FileText, Folder, Loader2 } from 'lucide-react';
import FilterToolbar, { SortOption } from '@/components/filters/FilterToolbar';

const formatDatePt = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatCardDate = (dateString?: string): { date: string; hour: string } => {
  if (!dateString) return { date: '', hour: '' };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { date: '', hour: '' };

  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');

  return {
    date: `${dia}/${mes}/${ano}`,
    hour: `${horas}:${minutos}`,
  };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

const Index: React.FC = () => {
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  const [featured, setFeatured] = useState<EditalItem[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [featuredItems, recentItems] = await Promise.all([
          fetchFeaturedEditais(3),
          fetchRecentUpdates(6),
        ]);

        if (cancelled) return;

        setFeatured(featuredItems);
        setUpdates(
          recentItems.map((item) => ({
            id: item['@id'],
            title: item.title || 'Sem título',
            date: formatDatePt(item.modified || item.created),
            description: item.type_title || item['@type'] || '',
            href: toEditalHref(item['@id']),
          }))
        );
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError('Não foi possível carregar os editais da UFAC.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedEditals = useMemo(() => {
    return [...featured].sort((a, b) => {
      switch (sortOption) {
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'date-newest':
          return (
            new Date(b.modified || b.created || 0).getTime() -
            new Date(a.modified || a.created || 0).getTime()
          );
        case 'date-oldest':
          return (
            new Date(a.modified || a.created || 0).getTime() -
            new Date(b.modified || b.created || 0).getTime()
          );
        default:
          return 0;
      }
    });
  }, [featured, sortOption]);

  return (
    <MainLayout className="flex-1 overflow-hidden p-3 sm:p-4 md:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 h-[calc(100dvh-3.5rem-1.5rem)] sm:h-[calc(100dvh-4rem-2rem)] md:h-[calc(100dvh-4rem-3rem)]"
      >
        <motion.div variants={itemVariants} className="shrink-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Editais em destaque
            </h2>
            <FilterToolbar
              sortOption={sortOption}
              onSortChange={setSortOption}
              className="mb-0"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando editais...
            </div>
          ) : error ? (
            <div className="rounded-lg bg-white p-6 text-center text-red-600 shadow-sm">
              {error}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
              {sortedEditals.length > 0 ? (
                sortedEditals.map((edital) => {
                  const { date, hour } = formatCardDate(
                    edital.created || edital.modified
                  );
                  return (
                    <motion.div
                      key={edital['@id']}
                      variants={itemVariants}
                      className="w-[min(85vw,20rem)] shrink-0 snap-start sm:w-auto"
                    >
                      <EditalCard
                        compact
                        title={edital.title}
                        description=""
                        icon={
                          edital['@type'] === 'Folder' ? (
                            <Folder
                              strokeWidth={1.5}
                              className="h-5 w-5 text-ufac-blue"
                            />
                          ) : (
                            <FileText
                              strokeWidth={1.5}
                              className="h-5 w-5 text-blue-600"
                            />
                          )
                        }
                        color={
                          edital['@type'] === 'Folder' ? 'bg-blue-50' : 'bg-red-50'
                        }
                        href={toEditalHref(edital['@id'])}
                        date={date}
                        hour={hour}
                        state={edital}
                      />
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="col-span-full w-full rounded-lg bg-white p-8 text-center shadow-sm"
                >
                  <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <p className="text-gray-600">Nenhum edital encontrado.</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex min-h-0 flex-1 flex-col">
          <UpdatesSection updates={updates} isLoading={isLoading} compact />
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Index;
