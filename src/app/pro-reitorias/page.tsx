import ProReitorias from '@/views/ProReitorias';
import { breadcrumbJsonLd } from '@/lib/seo';
import { buildMetadata, JsonLdScript } from '@/lib/seo-next';
import type { Metadata } from 'next';

export const revalidate = 86400; // 1 dia

export const metadata: Metadata = buildMetadata({
  title: 'Pró-Reitorias',
  description:
    'Pró-reitorias da UFAC e seus editais: graduação, pós-graduação, extensão, assuntos estudantis e gestão de pessoas.',
  path: '/pro-reitorias',
});

export default function ProReitoriasPage() {
  return (
    <>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: 'Pró-Reitorias', path: '/pro-reitorias' },
        ])}
      />
      <ProReitorias />
    </>
  );
}
