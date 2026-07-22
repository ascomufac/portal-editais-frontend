import ProReitoriaDetail from '@/views/ProReitoriaDetail';
import { breadcrumbJsonLd } from '@/lib/seo';
import { buildMetadata, JsonLdScript } from '@/lib/seo-next';
import { setorDisplayTitle } from '@/lib/plone-public';
import type { Metadata } from 'next';

export const revalidate = 86400; // 1 dia

type Props = {
  params: Promise<{ proReitoriaId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { proReitoriaId } = await params;
  const title = setorDisplayTitle(proReitoriaId);
  return buildMetadata({
    title,
    description: `Editais da ${title} na Universidade Federal do Acre.`,
    path: `/pro-reitorias/${proReitoriaId}`,
  });
}

export default async function ProReitoriaDetailPage({ params }: Props) {
  const { proReitoriaId } = await params;
  const title = setorDisplayTitle(proReitoriaId);

  return (
    <>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: 'Pró-Reitorias', path: '/pro-reitorias' },
          { name: title, path: `/pro-reitorias/${proReitoriaId}` },
        ])}
      />
      <ProReitoriaDetail />
    </>
  );
}
