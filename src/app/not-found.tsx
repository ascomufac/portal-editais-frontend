import NotFound from '@/views/NotFound';
import { buildMetadata } from '@/lib/seo-next';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: 'Página não encontrada',
  description: 'A página solicitada não existe no Portal de Editais UFAC.',
  path: '/404',
  noIndex: true,
});

export default function NotFoundPage() {
  return <NotFound />;
}
