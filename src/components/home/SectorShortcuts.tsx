'use client';

import React from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useMenuItems } from '@/hooks/useMenuItems';
import { getMenuIcon } from '@/components/sidebar/menuIcons';

/** Setores exibidos na home (a ordem segue o menu lateral). */
const SECTOR_IDS = new Set([
  'prograd',
  'propeg',
  'proppi',
  'proex',
  'proaes',
  'prodgep',
  'proplan',
  'colegio-de-aplicacao',
  'centros',
]);

/** Atalhos para os setores principais; a descrição vem da pasta no Plone. */
const SectorShortcuts: React.FC = () => {
  const { menuItems, isLoading } = useMenuItems();

  const sectors = menuItems.filter(
    (item) =>
      item.href &&
      item.href !== '#' &&
      !item.href.startsWith('http') &&
      SECTOR_IDS.has(item.id)
  );

  if (!isLoading && sectors.length === 0) return null;

  return (
    <section aria-labelledby="home-sectors-title">
      <h2
        id="home-sectors-title"
        className="mb-3 text-lg font-semibold text-gray-900 sm:text-xl"
      >
        Navegue por setor
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))
          : sectors.map((item) => (
              <Link
                key={item.id}
                href={item.href as string}
                className="group flex min-h-20 items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition hover:border-ufac-blue/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ufac-lightBlue text-ufac-blue">
                  <span className="h-6 w-6">{getMenuIcon(item.id)}</span>
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-gray-900">
                    {item.title}
                  </span>
                  {item.description?.trim() && (
                    <span
                      className="mt-0.5 line-clamp-2 block text-xs leading-snug text-gray-500"
                      title={item.description}
                    >
                      {item.description}
                    </span>
                  )}
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
};

export default SectorShortcuts;
