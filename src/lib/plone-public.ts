import { apiRequest } from '@/services/apiClient';
import { HOME_UPDATES_PAGE, mapRecentToUpdates } from '@/lib/updates';

export { mapRecentToUpdates };
import {
  fetchFeaturedEditais,
  fetchRecentUpdates,
  setorTitles,
  toSitePath,
  type EditalItem,
} from '@/services/editalService';

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

export async function getEditalMeta(
  pathSegments: string[]
): Promise<PloneContentMeta | null> {
  const path = pathSegments.map(decodeURIComponent).join('/');
  if (!path) return null;
  try {
    return await apiRequest<PloneContentMeta>(`/${toSitePath(path)}`, {
      auth: false,
    });
  } catch {
    return null;
  }
}

export function setorDisplayTitle(setorId: string): string {
  return setorTitles[setorId] || setorId;
}
