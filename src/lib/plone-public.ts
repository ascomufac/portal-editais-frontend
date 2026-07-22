import { apiRequest } from '@/services/apiClient';
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
    fetchRecentUpdates(6),
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

export function mapRecentToUpdates(recent: EditalItem[]) {
  const formatDatePt = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return recent.map((item) => ({
    id: item['@id'],
    title: item.title || 'Sem título',
    date: formatDatePt(item.modified || item.created),
    description: item.type_title || item['@type'] || '',
    href: `/edital/${toSitePath(item['@id'])}`,
  }));
}
