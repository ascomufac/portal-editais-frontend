import EditalDetail from '@/views/EditalDetail';
import { breadcrumbJsonLd, editalJsonLd, truncateDescription } from '@/lib/seo';
import { buildMetadata, JsonLdScript } from '@/lib/seo-next';
import { getEditalPage } from '@/lib/plone-public';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// 5 min de segurança: uploads pelo admin já invalidam na hora (/api/revalidate).
export const revalidate = 300;

/** Nenhuma pasta no build: cada uma é gerada no 1º acesso e fica em cache (ISR). */
export function generateStaticParams() {
  return [];
}

type Props = {
  params: Promise<{ path: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const meta = (await getEditalPage(path))?.meta;
  const href = `/edital/${path.map(encodeURIComponent).join('/')}`;
  if (!meta) {
    return buildMetadata({
      title: 'Edital',
      description: 'Detalhe do edital no Portal de Editais UFAC.',
      path: href,
    });
  }
  return buildMetadata({
    title: meta.title || 'Edital',
    description: truncateDescription(meta.description || meta.title),
    path: href,
    ogType: 'article',
  });
}

export default async function EditalRoute({ params }: Props) {
  const { path } = await params;
  if (!path?.length) notFound();

  const data = await getEditalPage(path);
  const meta = data?.meta;
  const href = `/edital/${path.map(encodeURIComponent).join('/')}`;
  const title = meta?.title || 'Edital';

  return (
    <>
      {meta && (
        <JsonLdScript
          data={editalJsonLd({
            title,
            description: meta.description,
            url: href,
            datePublished: meta.effective || meta.created,
            dateModified: meta.modified,
          })}
        />
      )}
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: title, path: href },
        ])}
      />
      <EditalDetail initial={data?.page} />
    </>
  );
}
