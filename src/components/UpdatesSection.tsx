import { motion } from 'framer-motion';
import { CalendarClock, Loader2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export interface Update {
  id: string;
  title: string;
  date: string;
  description: string;
  href?: string;
}

interface UpdatesSectionProps {
  updates: Update[];
  isLoading?: boolean;
}

const UpdatesSection: React.FC<UpdatesSectionProps> = ({ updates, isLoading = false }) => {
  return (
    <section className="mt-8">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 ">Atualizações</h2>
      </div>

      <div className="bg-white rounded-[32px] p-3 shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando atualizações...
          </div>
        ) : updates.length === 0 ? (
          <div className="p-6 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-gray-600">Nenhuma atualização recente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {updates.map((update, index) => {
              const content = (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{update.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">{update.date}</p>
                      {update.description && (
                        <p className="mt-2 text-sm text-gray-600">{update.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );

              return update.href ? (
                <Link key={update.id} to={update.href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={update.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpdatesSection;
