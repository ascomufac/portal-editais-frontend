import { apiRequest } from '@/services/apiClient';
import { HOME_UPDATES_PAGE, mapRecentToUpdates } from '@/lib/updates';

export { mapRecentToUpdates };
import {
  fetchFeaturedEditais,
  fetchRecentUpdates,
  RECENT_REVALIDATE_SECONDS,
  setorTitles,
  type EditalItem,
} from '@/services/editalService';
import {
  editalCacheTag,
  editalContentQuery,
  normalizeEditalPath,
  parseEditalBreadcrumbs,
  parseEditalContent,
  type EditalPageData,
} from '@/lib/edital-content';

export type PloneContentMeta = {
  title?: string;
  description?: string;
  modified?: string;
  created?: string;
  effective?: string;
  '@type'?: string;
  '@id'?: string;
};

export async function getHomeData() {
  const [featured, recent] = await Promise.all([
    fetchFeaturedEditais(3),
    fetchRecentUpdates(HOME_UPDATES_PAGE),
  ]);
  return { featured, recent };
}

/**
 * Conteúdo da pasta/item para a página do edital (metadados + listagem inicial).
 * Cache curto e com tag: o admin invalida em `/api/revalidate` ao alterar a pasta.
 */
export async function getEditalPage(
  pathSegments: string[]
): Promise<{ meta: PloneContentMeta; page: EditalPageData } | null> {
  const path = normalizeEditalPath(pathSegments.map(decodeURIComponent).join('/'));
  if (!path) return null;
  const next = { revalidate: RECENT_REVALIDATE_SECONDS, tags: [editalCacheTag(path)] };
  try {
    const [meta, breadcrumbs] = await Promise.all([
      apiRequest<PloneContentMeta>(`/${path}?${editalContentQuery()}`, {
        auth: false,
        next,
      }),
      apiRequest<unknown>(`/${path}/@breadcrumbs`, { auth: false, next }).catch(
        () => null
      ),
    ]);
    return {
      meta,
      page: {
        path,
        content: parseEditalContent(meta),
        breadcrumbs: parseEditalBreadcrumbs(breadcrumbs),
      },
    };
  } catch {
    return null;
  }
}

export function setorDisplayTitle(setorId: string): string {
  return setorTitles[setorId] || setorId;
}
