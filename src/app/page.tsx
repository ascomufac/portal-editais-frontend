import Index from '@/views/Index';
import {
  breadcrumbJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';
import { buildMetadata, JsonLdScript } from '@/lib/seo-next';
import { getHomeData, mapRecentToUpdates } from '@/lib/plone-public';
import type { EditalItem } from '@/services/editalService';
import type { Update } from '@/components/UpdatesSection';
import type { Metadata } from 'next';

export const revalidate = 86400; // 1 dia

export const metadata: Metadata = buildMetadata({
  title: null,
  description:
    'Portal oficial de editais e processos seletivos da Universidade Federal do Acre (UFAC). Consulte editais de graduação, pós-graduação, extensão e mais.',
  path: '/',
});

export default async function HomePage() {
  let featured: EditalItem[] = [];
  let updates: Update[] = [];
  try {
    const data = await getHomeData();
    featured = data.featured;
    updates = mapRecentToUpdates(data.recent);
  } catch (err) {
    console.error('Falha ao carregar home no servidor:', err);
  }

  return (
    <>
      <JsonLdScript data={[organizationJsonLd(), websiteJsonLd()]} />
      <JsonLdScript
        data={breadcrumbJsonLd([{ name: 'Início', path: '/' }])}
      />
      <Index initialFeatured={featured} initialUpdates={updates} />
    </>
  );
}
