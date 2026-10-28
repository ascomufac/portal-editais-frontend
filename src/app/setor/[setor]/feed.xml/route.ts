import { setorDisplayTitle } from '@/lib/plone-public';
import { buildRssXml, fetchFeedItems, rssResponse } from '@/lib/rss';

export const revalidate = 3600;

type Props = { params: Promise<{ setor: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { setor } = await params;
  const title = setorDisplayTitle(setor);
  const items = await fetchFeedItems(setor);
  return rssResponse(
    buildRssXml({
      title: `${title} · Portal de Editais UFAC`,
      description: `Últimas atualizações de editais do setor ${title} na UFAC.`,
      path: `/setor/${setor}`,
      items,
    })
  );
}
