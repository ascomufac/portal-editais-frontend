
import EditalCard from '@/components/EditalCard';
import SearchBar from '@/components/SearchBar';
import {
  AssuntosEstudantisIcon,
  ExtensaoIcon,
  GestaoPessoasIcon,
  GraduacaoIcon,
  PesquisaIcon
} from '@/components/sidebar/SidebarIcons';
import { Separator } from '@/components/ui/separator';
import { useCategory } from '@/hooks/useCategory';
import MainLayout from '@/layouts/MainLayout';
import { motion } from 'framer-motion';
import React from 'react';
import { useParams } from 'react-router-dom';
import NotFound from './NotFound';

// Pro-reitorias data mapping
const proReitoriasData = {
  'prograd': {
    title: 'Prograd',
    fullTitle: 'Pró-reitoria de Graduação',
    description: 'Responsável pela gestão das políticas de ensino de graduação na UFAC.',
    categoryPath: 'graduacao',
    icon: <div className="w-8 h-8"><GraduacaoIcon /></div>
  },
  'propeg': {
    title: 'Propeg',
    fullTitle: 'Pró-reitoria de Pesquisa e Pós-graduação',
    description: 'Coordena as atividades de pesquisa científica e ensino de pós-graduação da UFAC.',
    categoryPath: 'pos-graduacao',
    icon: <div className="w-8 h-8"><PesquisaIcon /></div>
  },
  'proex': {
    title: 'Proex',
    fullTitle: 'Pró-reitoria de Extensão e Cultura',
    description: 'Promove a integração entre a universidade e a sociedade por meio de ações culturais e extensionistas.',
    categoryPath: 'extensao',
    icon: <div className="w-8 h-8"><ExtensaoIcon /></div>
  },
  'proaes': {
    title: 'Proaes',
    fullTitle: 'Pró-reitoria de Assuntos Estudantis',
    description: 'Desenvolve políticas de apoio e assistência aos estudantes da UFAC.',
    categoryPath: 'estudantis',
    icon: <div className="w-8 h-8"><AssuntosEstudantisIcon /></div>
  },
  'prodgep': {
    title: 'Prodgep',
    fullTitle: 'Pró-reitoria de Gestão de Pessoas',
    description: 'É responsável pelas políticas de gestão de pessoal na UFAC.',
    categoryPath: 'pessoas',
    icon: <div className="w-8 h-8"><GestaoPessoasIcon /></div>
  }
};

const ProReitoriaDetail: React.FC = () => {
  const { proReitoriaId } = useParams<{ proReitoriaId: string }>();
  
  // Check if the pro-reitoria exists
  if (!proReitoriaId || !proReitoriasData[proReitoriaId as keyof typeof proReitoriasData]) {
    return <NotFound />;
  }
  
  const proReitoriaInfo = proReitoriasData[proReitoriaId as keyof typeof proReitoriasData];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const category = useCategory();
  
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

  // Use the category data that corresponds to this pro-reitoria
  const relatedCategoryPath = proReitoriaInfo.categoryPath;
  const categoryData = useCategory();

  return (
    <MainLayout pageTitle={proReitoriaInfo.title}>
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
          <div className="flex items-center py-4">
            <div className="mr-4 p-3 bg-ufac-lightBlue rounded-full min-h-[56px] min-w-[56px] max-h-[56px] max-w-[56px] flex items-center justify-center">
              {proReitoriaInfo.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-ufac-blue">{proReitoriaInfo.title}</h1>
              <p className="text-xs text-gray-600 font-semibold">{proReitoriaInfo.fullTitle}</p>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-gray-500 text-sm">{proReitoriaInfo.description}</p>
          </div>
          <Separator className="bg-gray-200 h-0.5 mb-4" />
          
          
          <h3 className="text-xl font-medium text-gray-800 mb-4">Editais disponíveis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {categoryData.editais.map((editalItem) => (
              <motion.div
                key={editalItem.id}
                variants={itemVariants}
              >
                <EditalCard
                  title={editalItem.title}
                  description={editalItem.description}
                  icon={editalItem.icon}
                  color={editalItem.color}
                  href={editalItem.href}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default ProReitoriaDetail;
