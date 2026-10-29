import {
  RECENT_REVALIDATE_SECONDS,
  RECENT_UPDATES_TAG,
  searchSite,
  toItemHref,
  toSitePath,
  type EditalItem,
} from '@/services/editalService';
import { getPublicSiteUrl } from '@/services/ploneConfig';

const FEED_SIZE = 30;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toRfc822 = (iso?: string): string => {
  const date = iso ? new Date(iso) : new Date();
  return (Number.isNaN(date.getTime()) ? new Date() : date).toUTCString();
};

/** Últimos itens (por modificação) de um setor, ou de todo o portal. */
export const fetchFeedItems = async (setorId?: string): Promise<EditalItem[]> => {
  const data = await searchSite({
    SearchableText: setorId ? undefined : 'Edital',
    path: setorId ? `/${setorId}` : undefined,
    b_size: FEED_SIZE,
    sort_on: 'modified',
    sort_order: 'descending',
  }, { next: { revalidate: RECENT_REVALIDATE_SECONDS, tags: [RECENT_UPDATES_TAG] } });
  // A pasta do próprio setor também entra na busca; fica fora do feed.
  return (data.items ?? []).filter(
    (item) => !setorId || toSitePath(item['@id']) !== setorId
  );
};

type FeedInput = {
  title: string;
  description: string;
  /** Caminho do portal ao qual o feed pertence (ex.: /setor/prograd). */
  path: string;
  items: EditalItem[];
};

export const buildRssXml = ({ title, description, path, items }: FeedInput): string => {
  const site = getPublicSiteUrl();
  const itemsXml = items
    .map((item) => {
      const link = `${site}${toItemHref(item)}`;
      const label = item.type_title || item['@type'] || '';
      return `    <item>
      <title>${escapeXml(item.title || 'Sem título')}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(item.modified || item.created)}</pubDate>${
        label ? `\n      <description>${escapeXml(label)}</description>` : ''
      }
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(site + path)}</link>
    <description>${escapeXml(description)}</description>
    <language>pt-BR</language>
    <atom:link href="${escapeXml(`${site}${path === '/' ? '' : path}/feed.xml`)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;
};

export const rssResponse = (xml: string): Response =>
  new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });

