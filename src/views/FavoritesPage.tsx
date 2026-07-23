'use client';

import EditalCard from '@/components/EditalCard';
import MainLayout from '@/layouts/MainLayout';
import { useFavorites } from '@/hooks/useFavorites';
import type { EditalItem } from '@/services/editalService';
import { FileText, Folder, Star } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const FavoritesPage: React.FC = () => {
  const { favorites } = useFavorites();

  return (
    <MainLayout
      pageTitle="Favoritos"
      className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Star className="h-5 w-5" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Favoritos
              </h1>
              <p className="text-sm text-slate-500">
                Editais salvos neste dispositivo
                {favorites.length > 0 ? ` · ${favorites.length}` : ''}
              </p>
            </div>
          </div>
        </header>

        {favorites.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
            <Star className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-base font-medium text-slate-700">
              Nenhum favorito ainda
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Toque na estrela de um edital para salvá-lo aqui.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex text-sm font-medium text-ufac-blue hover:underline"
            >
              Ir para o início
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {favorites.map((item) => (
              <EditalCard
                key={item.path}
                title={item.title}
                description=""
                href={item.href.startsWith('/') ? item.href : `/edital/${item.path}`}
                compact
                icon={
                  item['@type'] === 'Folder' || item['@type'] === 'Collection' ? (
                    <Folder
                      strokeWidth={1.5}
                      className="h-5 w-5 text-ufac-blue"
                    />
                  ) : (
                    <FileText
                      strokeWidth={1.5}
                      className="h-5 w-5 text-blue-600"
                    />
                  )
                }
                color={
                  item['@type'] === 'Folder' || item['@type'] === 'Collection'
                    ? 'bg-blue-50'
                    : 'bg-red-50'
                }
                state={
                  {
                    '@id': item.path,
                    '@type': item['@type'] || 'Folder',
                    title: item.title,
                    description: '',
                    type_title: '',
                    review_state: null,
                    image_field: '',
                    image_scales: {},
                    created: item.savedAt,
                    modified: item.savedAt,
                    effective: item.savedAt,
                  } satisfies Partial<EditalItem> as EditalItem
                }
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FavoritesPage;
