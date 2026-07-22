import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import { useCategory } from '@/hooks/useCategory';
import EditalsList from '@/components/category/EditalsList';
import CategoryHeader from '@/components/category/CategoryHeader';
import { Loader2 } from 'lucide-react';

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

const CategoryPage: React.FC = () => {
  const currentCategory = useCategory();

  useEffect(() => {
    if (currentCategory.title) {
      document.title = `${currentCategory.title} | Portal de Editais UFAC`;
    }
  }, [currentCategory.title]);

  return (
    <MainLayout pageTitle={currentCategory.title || 'Categoria'}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants}>
          <CategoryHeader title={currentCategory.title || 'Carregando...'} />
        </motion.div>

        {currentCategory.isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando editais...
          </div>
        ) : currentCategory.error ? (
          <div className="text-center p-8 text-red-600 bg-white rounded-lg shadow-sm">
            {currentCategory.error}
          </div>
        ) : (
          <EditalsList editais={currentCategory.editais} />
        )}
      </motion.div>
    </MainLayout>
  );
};

export default CategoryPage;
