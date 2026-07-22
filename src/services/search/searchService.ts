import { SearchResult, SearchSection, sectionPathMap } from './types';
import { extractFileNameFromUrl } from './utils';

const BASE_URL = 'https://www3.ufac.br/++api++';

/**
 * Busca documentos na API Plone da UFAC
 */
export const searchDocuments = async (
  query: string,
  section: SearchSection = 'all'
): Promise<{ items: SearchResult[]; total: number }> => {
  if (!query || query.length < 3) {
    return { items: [], total: 0 };
  }

  const searchParams = new URLSearchParams();
  searchParams.append('SearchableText', query);
  searchParams.append('sort_on', 'created');
  searchParams.append('sort_order', 'descending');
  searchParams.append('metadata_fields', 'created');
  searchParams.append('metadata_fields', 'modified');
  searchParams.append('metadata_fields', 'Creator');
  searchParams.append('metadata_fields', 'effective');

  let apiPath = '';
  if (section !== 'all' && sectionPathMap[section]) {
    apiPath = `/${sectionPathMap[section]}`;
  }

  const apiUrl = `${BASE_URL}${apiPath}/@search?${searchParams.toString()}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  const data = await response.json();

  if (!data.items || !Array.isArray(data.items)) {
    return { items: [], total: 0 };
  }

  const results: SearchResult[] = data.items.map((item: Record<string, string>, index: number) => {
    const itemPath = item['@id'] || '';
    let itemSection: SearchSection = 'all';

    Object.entries(sectionPathMap).forEach(([sectionKey, path]) => {
      if (itemPath.includes(`/${path}`)) {
        itemSection = sectionKey as SearchSection;
      }
    });

    return {
      id: `result-${index}-${item['@id'] || Date.now()}`,
      title: item.title || extractFileNameFromUrl(item['@id']),
      description: item.description || '',
      url: item['@id'],
      section: itemSection,
      date: item.created || item.modified || '',
      type: item['@type'] || 'Document',
    };
  });

  return {
    items: results,
    total: data.items_total || results.length,
  };
};
