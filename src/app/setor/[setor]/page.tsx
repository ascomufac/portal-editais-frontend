import SetorPage from '@/views/SetorPage';
import { breadcrumbJsonLd } from '@/lib/seo';
import { buildMetadata, JsonLdScript } from '@/lib/seo-next';
import { setorDisplayTitle } from '@/lib/plone-public';
import type { Metadata } from 'next';

export const revalidate = 86400; // 1 dia

type Props = { params: Promise<{ setor: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { setor } = await params;
  const title = setorDisplayTitle(setor);
  return buildMetadata({
    title,
    description: `Editais e processos seletivos do setor ${title} na UFAC.`,
    path: `/setor/${setor}`,
  });
}

export default async function SetorRoute({ params }: Props) {
  const { setor } = await params;
  const title = setorDisplayTitle(setor);

  return (
    <>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: title, path: `/setor/${setor}` },
        ])}
      />
      <SetorPage />
    </>
  );
}
