import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { searchSite, setorTitles, toSitePath } from '@/services/editalService';

export const revalidate = 86400; // 1 dia

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: absoluteUrl('/pro-reitorias'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...Object.keys(setorTitles).map((setor) => ({
      url: absoluteUrl(`/setor/${setor}`),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];

  let editalEntries: MetadataRoute.Sitemap = [];
  try {
    const data = await searchSite({
      portal_type: 'Folder',
      SearchableText: 'Edital',
      b_size: 200,
      sort_on: 'modified',
      sort_order: 'descending',
    });
    editalEntries = (data.items || []).map((item) => ({
      url: absoluteUrl(`/edital/${toSitePath(item['@id'])}`),
      lastModified: item.modified ? new Date(item.modified) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('sitemap: falha ao listar editais', err);
  }

  return [...staticEntries, ...editalEntries];
}
