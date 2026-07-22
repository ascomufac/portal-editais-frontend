import type { MetadataRoute } from 'next';
import { getPublicSiteUrl } from '@/services/ploneConfig';

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteUrl();
  let host: string | undefined;
  try {
    host = new URL(base).host;
  } catch {
    host = undefined;
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/resultados-busca', '/visualizar-pdf'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    ...(host ? { host } : {}),
  };
}
