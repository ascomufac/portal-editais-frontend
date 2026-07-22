import EditalCard from '@/components/EditalCard';
import SearchBar from '@/components/SearchBar';
import CategoryHeader from '@/components/category/CategoryHeader';
import {
  AssuntosEstudantisIcon,
  ExtensaoIcon,
  GestaoPessoasIcon,
  GraduacaoIcon,
  PesquisaIcon,
} from '@/components/sidebar/SidebarIcons';
import MainLayout from '@/layouts/MainLayout';
import { fetchProReitorias, type MenuItem } from '@/services/editalService';
import { motion } from 'framer-motion';
import { Building, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const iconMap: Record<string, JSX.Element> = {
  prograd: (
    <div className="w-8 h-8">
      <GraduacaoIcon />
    </div>
  ),
  propeg: (
    <div className="w-8 h-8">
      <PesquisaIcon />
    </div>
  ),
  proex: (
    <div className="w-8 h-8">
      <ExtensaoIcon />
    </div>
  ),
  proaes: (
    <div className="w-8 h-8">
      <AssuntosEstudantisIcon />
    </div>
  ),
  prodgep: (
    <div className="w-8 h-8">
      <GestaoPessoasIcon />
    </div>
  ),
};

const colorMap: Record<string, string> = {
  prograd: 'bg-blue-50',
  propeg: 'bg-indigo-50',
  proex: 'bg-purple-50',
  proaes: 'bg-green-50',
  prodgep: 'bg-yellow-50',
};

const descriptions: Record<string, string> = {
  prograd: 'Pró-reitoria de Graduação',
  propeg: 'Pró-reitoria de Pesquisa e Pós-graduação',
  proex: 'Pró-reitoria de Extensão e Cultura',
  proaes: 'Pró-reitoria de Assuntos Estudantis',
  prodgep: 'Pró-reitoria de Gestão de Pessoas',
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

const ProReitorias: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProReitorias();
        if (!cancelled) setItems(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Não foi possível carregar as pró-reitorias.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MainLayout pageTitle="Pró-reitorias">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <SearchBar />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CategoryHeader title="Pró-reitorias" />

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando...
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 mt-6">
              {items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <EditalCard
                    title={item.title}
                    description={descriptions[item.id] || item.description || ''}
                    icon={
                      iconMap[item.id] || (
                        <Building className="h-8 w-8 text-ufac-blue" />
                      )
                    }
                    color={colorMap[item.id] || 'bg-blue-50'}
                    href={`/setor/${item.id}`}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default ProReitorias;
