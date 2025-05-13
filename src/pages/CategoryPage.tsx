
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import SearchBar from '@/components/SearchBar';
import { useCategory } from '@/hooks/useCategory';
import EditalsList from '@/components/category/EditalsList';
import CategoryHeader from '@/components/category/CategoryHeader';

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

/**
 * Página de categoria que exibe editais relacionados a uma categoria específica
 * @returns {JSX.Element} Componente React renderizado
 */
const CategoryPage: React.FC = () => {
  const currentCategory = useCategory();
  
  useEffect(() => {
    console.log('CategoryPage renderizando com título:', currentCategory.title);
  }, [currentCategory.title]);
  
  return (
    <MainLayout pageTitle={currentCategory.title}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <SearchBar />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CategoryHeader title={currentCategory.title} />
        </motion.div>

        <EditalsList editais={currentCategory.editais} />
      </motion.div>
    </MainLayout>
  );
};

export default CategoryPage;
