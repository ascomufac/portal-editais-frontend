import { buildMetadata } from '@/lib/seo-next';
import type { Metadata } from 'next';
import PdfViewerClient from './PdfViewerClient';

export const metadata: Metadata = buildMetadata({
  title: 'Visualizador de PDF',
  description: 'Visualização de documento PDF do Portal de Editais UFAC.',
  path: '/visualizar-pdf',
  noIndex: true,
});

export default function PdfRoute() {
  return <PdfViewerClient />;
}
