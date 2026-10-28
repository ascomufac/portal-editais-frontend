'use client';

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { setorTagFromId } from '@/lib/updates';

const MAX_ITEMS = 5;

/** Favoritos salvos neste dispositivo; sem favoritos mostra um convite. */
const HomeFavorites: React.FC = () => {
  const { favorites } = useFavorites();
  const items = favorites.slice(0, MAX_ITEMS);

  return (
    <aside aria-labelledby="home-favorites-title">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2
          id="home-favorites-title"
          className="text-lg font-semibold text-gray-900 sm:text-xl"
        >
          Seus favoritos
        </h2>
        {favorites.length > 0 && (
          <Link
            href="/favoritos"
            className="text-sm font-semibold text-ufac-blue hover:underline"
          >
            Ver todos
          </Link>
        )}
      </div>

      {items.length > 0 ? (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                href={item.href.startsWith('/') ? item.href : `/edital/${item.path}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50"
              >
                <Star
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
                  fill="currentColor"
                  aria-hidden
                />
                <span className="min-w-0">
                  <span
                    className="line-clamp-2 block text-sm font-medium text-gray-900"
                    title={item.title}
                  >
                    {item.title}
                  </span>
                  {setorTagFromId(item.path) && (
                    <span className="mt-1 inline-flex rounded-full bg-ufac-lightBlue px-2.5 py-0.5 text-xs font-semibold text-ufac-blue">
                      {setorTagFromId(item.path)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-ufac-lightBlue px-4 py-4 text-sm leading-relaxed text-slate-700">
          Toque na <strong>estrela</strong> de um edital para salvá-lo aqui e
          acompanhá-lo sem precisar procurar de novo.
        </p>
      )}
    </aside>
  );
};

export default HomeFavorites;
