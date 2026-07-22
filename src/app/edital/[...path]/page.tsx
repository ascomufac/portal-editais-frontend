import EditalDetail from '@/views/EditalDetail';
import { breadcrumbJsonLd, editalJsonLd, truncateDescription } from '@/lib/seo';
import { buildMetadata, JsonLdScript } from '@/lib/seo-next';
import { getEditalMeta } from '@/lib/plone-public';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 86400; // 1 dia

type Props = {
  params: Promise<{ path: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const meta = await getEditalMeta(path);
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

  const meta = await getEditalMeta(path);
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
      <EditalDetail />
    </>
  );
}
