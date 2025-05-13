
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import EditalCard from '@/components/EditalCard';
import { FileText } from 'lucide-react';
import { EditalType } from '@/types/edital';
import { useIsMobile } from '@/hooks/use-mobile';
import FilterToolbar, { SortOption } from '../filters/FilterToolbar';

/**
 * Interface para as propriedades do componente EditalsList
 * @interface EditalsListProps
 * @property {EditalType[]} editais - Lista de editais a serem exibidos
 */
interface EditalsListProps {
  editais: EditalType[];
}

/**
 * Variantes de animação para o contêiner
 * @description Definições de animação para entrada e saída do contêiner usando Framer Motion
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
 * @description Definições de animação para entrada e saída dos itens individuais
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
 * Componente para exibir uma lista de editais com opções de ordenação
 * @param {EditalsListProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 * @description Renderiza uma grade responsiva de cards de editais com opções 
 *              de ordenação e animações de entrada para cada item.
 */
const EditalsList: React.FC<EditalsListProps> = ({ editais }) => {
  const isMobile = useIsMobile();
  const [sortOption, setSortOption] = useState<SortOption>('title-asc');
  
  /**
   * Lista de editais ordenada com base na opção de ordenação selecionada
   * @description Memo que recalcula a ordenação apenas quando a lista de editais ou a opção de ordenação muda
   */
  const sortedEditals = useMemo(() => {
    // Ordena os editais
    return [...editais].sort((a, b) => {
      switch(sortOption) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-newest':
          // Aqui normalmente ordenaríamos por data, mas como nossos dados de mock não têm datas,
          // usaremos o ID como proxy (assumindo que IDs mais altos são mais recentes)
          return parseInt(b.id) - parseInt(a.id);
        case 'date-oldest':
          return parseInt(a.id) - parseInt(b.id);
        default:
          return 0;
      }
    });
  }, [editais, sortOption]);
  
  /**
   * Manipula a mudança de opção de ordenação
   * @param {SortOption} option - Nova opção de ordenação selecionada
   */
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };
  
  return (
    <div>
      {editais.length > 0 && (
        <FilterToolbar
          sortOption={sortOption}
          onSortChange={handleSortChange}
          className="mb-6"
        />
      )}
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
      >
        {sortedEditals.length > 0 ? (
          sortedEditals.map((edital) => (
            <motion.div
              key={edital.id}
              variants={itemVariants}
              className="h-full"
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
            <p className="text-gray-600">
              Nenhum edital encontrado para esta categoria.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EditalsList;
