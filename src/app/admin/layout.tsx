import { buildMetadata } from '@/lib/seo-next';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: 'Administração',
  description: 'Área administrativa do Portal de Editais UFAC.',
  path: '/admin',
  noIndex: true,
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
