import FavoritesPage from '@/views/FavoritesPage';
import { buildMetadata } from '@/lib/seo-next';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: 'Favoritos',
  description: 'Seus editais favoritos no Portal de Editais UFAC.',
  path: '/favoritos',
  noIndex: true,
});

export default function FavoritosRoute() {
  return <FavoritesPage />;
}
