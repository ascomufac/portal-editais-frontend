import React, { useEffect, useMemo, useState } from 'react';
import EditalCard from '@/components/EditalCard';
import SearchBar from '@/components/SearchBar';
import UpdatesSection, { Update } from '@/components/UpdatesSection';
import { useIsMobile } from '@/hooks/use-mobile';
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
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const Index: React.FC = () => {
  const isMobile = useIsMobile();
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
          fetchFeaturedEditais(6),
          fetchRecentUpdates(8),
        ]);

        if (cancelled) return;

        setFeatured(featuredItems);
        setUpdates(
          recentItems.map((item) => ({
            id: item['@id'],
            title: item.title || 'Sem título',
            date: formatDatePt(item.modified || item.created),
            description: item.description || item.type_title || item['@type'] || '',
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
    <MainLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <SearchBar />
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Editais em destaque</h2>

          <FilterToolbar
            sortOption={sortOption}
            onSortChange={setSortOption}
            className="mb-4"
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando editais...
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm text-red-600">
              {error}
            </div>
          ) : (
            <div
              className={`grid gap-4 sm:gap-6 ${
                isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {sortedEditals.length > 0 ? (
                sortedEditals.map((edital) => {
                  const { date, hour } = formatCardDate(edital.created || edital.modified);
                  return (
                    <motion.div
                      key={edital['@id']}
                      variants={itemVariants}
                      className={isMobile ? 'col-span-1' : ''}
                    >
                      <EditalCard
                        title={edital.title}
                        description={edital.description || ''}
                        icon={
                          edital['@type'] === 'Folder' ? (
                            <Folder strokeWidth={1} className="h-8 w-8 text-ufac-blue" />
                          ) : (
                            <FileText strokeWidth={1} className="h-8 w-8 text-blue-600" />
                          )
                        }
                        color={edital['@type'] === 'Folder' ? 'bg-blue-50' : 'bg-red-50'}
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
                  className="text-center p-6 sm:p-12 bg-white rounded-lg shadow-sm col-span-full"
                >
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum edital encontrado.</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <UpdatesSection updates={updates} isLoading={isLoading} />
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Index;
