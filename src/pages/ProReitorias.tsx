
import EditalCard from '@/components/EditalCard';
import SearchBar from '@/components/SearchBar';
import CategoryHeader from '@/components/category/CategoryHeader';
import {
  AssuntosEstudantisIcon,
  ExtensaoIcon,
  GestaoPessoasIcon,
  GraduacaoIcon,
  PesquisaIcon
} from '@/components/sidebar/SidebarIcons';
import MainLayout from '@/layouts/MainLayout';
import { motion } from 'framer-motion';
import React from 'react';

/**
 * Página que lista todas as Pró-reitorias da UFAC
 * @returns {JSX.Element} Componente React renderizado
 */
const ProReitorias: React.FC = () => {
  /**
   * Lista de pró-reitorias disponíveis
   * @type {Array<{id: string, title: string, description: string, icon: JSX.Element, color: string, to: string}>}
   */
  const proReitorias = [
    {
      id: '1',
      title: 'Prograd',
      description: 'Pró-reitoria de Graduação',
      icon: <div className="w-8 h-8"><GraduacaoIcon /></div>,
      color: 'bg-blue-50',
      to: '/pro-reitorias/prograd'
    },
    {
      id: '2',
      title: 'Propeg',
      description: 'Pró-reitoria de Pesquisa e Pós-graduação',
      icon: <div className="w-8 h-8"><PesquisaIcon /></div>,
      color: 'bg-indigo-50',
      to: '/pro-reitorias/propeg'
    },
    {
      id: '3',
      title: 'Proex',
      description: 'Pró-reitoria de Extensão e Cultura',
      icon: <div className="w-8 h-8"><ExtensaoIcon /></div>,
      color: 'bg-purple-50',
      to: '/pro-reitorias/proex'
    },
    {
      id: '4',
      title: 'Proaes',
      description: 'Pró-reitoria de Assuntos Estudantis',
      icon: <div className="w-8 h-8"><AssuntosEstudantisIcon /></div>,
      color: 'bg-green-50',
      to: '/pro-reitorias/proaes'
    },
    {
      id: '5',
      title: 'Prodgep',
      description: 'Pró-reitoria de Gestão de Pessoas',
      icon: <div className="w-8 h-8"><GestaoPessoasIcon /></div>,
      color: 'bg-yellow-50',
      to: '/pro-reitorias/prodgep'
    }
  ];

  /**
   * Variantes de animação para o contêiner
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  /**
   * Variantes de animação para os itens
   */
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 mt-6">
            {proReitorias.map((proreitoriaItem) => (
              <motion.div
                key={proreitoriaItem.id}
                variants={itemVariants}
              >
                <EditalCard
                  title={proreitoriaItem.title}
                  description={proreitoriaItem.description}
                  icon={proreitoriaItem.icon}
                  color={proreitoriaItem.color}
                  href={proreitoriaItem.to}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default ProReitorias;
