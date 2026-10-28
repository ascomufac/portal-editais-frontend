import { buildRssXml, fetchFeedItems, rssResponse } from '@/lib/rss';

export const revalidate = 3600;

export async function GET() {
  const items = await fetchFeedItems();
  return rssResponse(
    buildRssXml({
      title: 'Portal de Editais UFAC',
      description: 'Últimas atualizações de editais e processos seletivos da UFAC.',
      path: '/',
      items,
    })
  );
}
