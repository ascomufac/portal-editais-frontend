import SearchResults from '@/views/SearchResults';
import { buildMetadata } from '@/lib/seo-next';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = buildMetadata({
  title: 'Resultados da busca',
  description: 'Resultados de busca no Portal de Editais UFAC.',
  path: '/resultados-busca',
  noIndex: true,
});

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
          Carregando busca…
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
