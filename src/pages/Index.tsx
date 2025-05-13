import React, { useState, useMemo } from 'react';
import EditalCard from '@/components/EditalCard';
import SearchBar from '@/components/SearchBar';
import UpdatesSection from '@/components/UpdatesSection';
import { useIsMobile } from '@/hooks/use-mobile';
import MainLayout from '@/layouts/MainLayout';
import { motion } from 'framer-motion';
import { FileText, GraduationCap, Users } from 'lucide-react';
import FilterToolbar, { SortOption } from '@/components/filters/FilterToolbar';

// Mock data
const featuredEditals = [
  {
    id: '1',
    title: 'Medicina',
    description: 'Processo Seletivo: Curso Bacharelado Medicina',
    color: 'bg-blue-50',
    icon: <FileText strokeWidth={1} className="h-8 w-8 text-blue-600" />,
    href: '/edital/medicina'
  },
  {
    id: '2',
    title: 'SISU 2025',
    description: 'Processo Seletivo Unificado',
    color: 'bg-indigo-50',
    icon: <GraduationCap strokeWidth={1} className="h-8 w-8 text-indigo-600" />,
    href: '/edital/sisu-2025'
  },
  {
    id: '3',
    title: 'Vagas residuais',
    description: 'Processo Seletivo Vagas Residuais',
    color: 'bg-purple-50',
    icon: <Users strokeWidth={1} className="h-8 w-8 text-purple-600" />,
    href: '/edital/vagas-residuais'
  }
];

const recentUpdates = [
  {
    id: '1',
    title: 'Publicado edital de Vagas Residuais',
    date: '12 de agosto de 2023',
    description: 'O edital para preenchimento de vagas residuais para o semestre 2023/2 foi publicado.'
  },
  {
    id: '2',
    title: 'Retificação no edital SISU 2025',
    date: '10 de agosto de 2023',
    description: 'Foi publicada retificação sobre as datas de matrícula para calouros do SISU 2025.'
  },
  {
    id: '3',
    title: 'Resultado preliminar do edital de Medicina',
    date: '05 de agosto de 2023',
    description: 'O resultado preliminar do edital para o curso de Medicina foi publicado.'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  const [sortOption, setSortOption] = useState<SortOption>('title-asc');
  
  const sortedEditals = useMemo(() => {
    // Sort the editals
    return [...featuredEditals].sort((a, b) => {
      switch(sortOption) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-newest':
          return parseInt(b.id) - parseInt(a.id);
        case 'date-oldest':
          return parseInt(a.id) - parseInt(b.id);
        default:
          return 0;
      }
    });
  }, [sortOption]);
  
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
          
          <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {sortedEditals.length > 0 ? (
              sortedEditals.map((edital) => (
                <motion.div
                  key={edital.id}
                  variants={itemVariants}
                  className={isMobile ? 'col-span-1' : ''}
                >
                  <EditalCard
                    title={edital.title}
                    description={edital.description}
                    icon={edital.icon}
                    color={edital.color}
                    href={edital.href}
                  />
                </motion.div>
              ))
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
        </motion.div>

        <motion.div variants={itemVariants}>
          <UpdatesSection updates={recentUpdates} />
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Index;
