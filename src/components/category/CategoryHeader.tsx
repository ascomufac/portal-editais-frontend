import { getMenuIcon, getMenuIconByTitle } from '@/components/sidebar/menuIcons';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import React from 'react';

interface CategoryHeaderProps {
  title: string;
  /** ID do item no menu/Plone — garante o mesmo ícone da sidebar */
  itemId?: string;
}

const proReitoriaMap: Record<string, { abbreviation: string; fullName: string }> = {
  Graduação: {
    abbreviation: 'Prograd',
    fullName: 'Pró-reitoria de Graduação',
  },
  'Pesquisa e Pós-graduação': {
    abbreviation: 'Propeg',
    fullName: 'Pró-reitoria de Pesquisa e Pós-graduação',
  },
  'Extensão e Cultura': {
    abbreviation: 'Proex',
    fullName: 'Pró-reitoria de Extensão e Cultura',
  },
  'Assuntos Estudantis': {
    abbreviation: 'Proaes',
    fullName: 'Pró-reitoria de Assuntos Estudantis',
  },
  'Gestão de Pessoas': {
    abbreviation: 'Prodgep',
    fullName: 'Pró-reitoria de Gestão de Pessoas',
  },
  Prograd: {
    abbreviation: 'Prograd',
    fullName: 'Pró-reitoria de Graduação',
  },
  Propeg: {
    abbreviation: 'Propeg',
    fullName: 'Pró-reitoria de Pesquisa e Pós-graduação',
  },
  Proex: {
    abbreviation: 'Proex',
    fullName: 'Pró-reitoria de Extensão e Cultura',
  },
  Proaes: {
    abbreviation: 'Proaes',
    fullName: 'Pró-reitoria de Assuntos Estudantis',
  },
  Prodgep: {
    abbreviation: 'Prodgep',
    fullName: 'Pró-reitoria de Gestão de Pessoas',
  },
};

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ title, itemId }) => {
  const icon = itemId ? getMenuIcon(itemId) : getMenuIconByTitle(title);
  const isProReitoria = title in proReitoriaMap;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      className="mb-4"
    >
      <div className="flex items-center gap-3 py-3 sm:gap-4 sm:py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ufac-lightBlue p-2.5 sm:h-14 sm:w-14 sm:p-3 [&>svg]:h-full [&>svg]:w-full">
          {icon}
        </div>
        <div className="min-w-0">
          {isProReitoria ? (
            <>
              <h1 className="truncate text-xl font-black text-ufac-blue sm:text-2xl">
                {proReitoriaMap[title].abbreviation}
              </h1>
              <p className="text-xs font-semibold text-gray-600 line-clamp-2">
                {proReitoriaMap[title].fullName}
              </p>
            </>
          ) : (
            <h1 className="truncate text-xl font-bold text-ufac-blue sm:text-2xl">{title}</h1>
          )}
        </div>
      </div>
      <Separator className="h-0.5 bg-gray-200" />
    </motion.div>
  );
};

export default CategoryHeader;
