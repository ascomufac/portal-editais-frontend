import SetorPage from '@/views/SetorPage';
import { breadcrumbJsonLd } from '@/lib/seo';
import { buildMetadata, JsonLdScript } from '@/lib/seo-next';
import { setorDisplayTitle } from '@/lib/plone-public';
import type { Metadata } from 'next';

export const revalidate = 86400; // 1 dia

type Props = {
  params: Promise<{ setor: string; page: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { setor, page } = await params;
  const title = setorDisplayTitle(setor);
  return buildMetadata({
    title: `${title} — página ${page}`,
    description: `Editais do setor ${title} na UFAC (página ${page}).`,
    path: `/setor/${setor}/${page}`,
    noIndex: Number(page) > 1,
  });
}

export default async function SetorPagedRoute({ params }: Props) {
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
