
import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import React from 'react';

/**
 * Interface para um item de atualização
 * @interface Update
 * @property {string} id - Identificador único da atualização
 * @property {string} title - Título da atualização
 * @property {string} date - Data da atualização
 * @property {string} description - Descrição da atualização
 */
interface Update {
  id: string;
  title: string;
  date: string;
  description: string;
}

/**
 * Interface para as propriedades do componente UpdatesSection
 * @interface UpdatesSectionProps
 * @property {Update[]} updates - Lista de atualizações a serem exibidas
 */
interface UpdatesSectionProps {
  updates: Update[];
}

/**
 * Componente que exibe uma seção de atualizações recentes
 * @param {UpdatesSectionProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 */
const UpdatesSection: React.FC<UpdatesSectionProps> = ({ updates }) => {
  return (
    <section className="mt-8">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 ">Atualizações</h2>
      </div>

      <div className="bg-white rounded-[32px] p-3 shadow-sm border border-gray-100 overflow-hidden">
        {updates.length === 0 ? (
          <div className="p-6 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-gray-600">Nenhuma atualização recente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {updates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{update.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{update.date}</p>
                    <p className="mt-2 text-sm text-gray-600">{update.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpdatesSection;
