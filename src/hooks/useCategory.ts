'use client';

import { useEffect, useState, createElement } from 'react';
import { useParams, usePathname } from 'next/navigation';
import {
  categoryToSetorMap,
  fetchEditaisBySetor,
  resolveSetorId,
  searchSetorItems,
  setorTitles,
  toEditalHref,
  type EditalItem,
} from '@/services/editalService';
import { CategoryDataType, EditalType } from '@/types/edital';
import { FileText, Folder } from 'lucide-react';

const mapItemToEdital = (item: EditalItem, section: string): EditalType => ({
  id: item['@id'],
  title: item.title || '',
  description: item.description || '',
  color: item['@type'] === 'Folder' ? 'bg-blue-50' : 'bg-red-50',
  icon: createElement(
    item['@type'] === 'Folder' ? Folder : FileText,
    { className: 'h-8 w-8 text-ufac-blue', strokeWidth: 1 }
  ),
  href: toEditalHref(item['@id']),
  modified: item.modified,
  effective: item.effective,
  author: item.Creator || item.creators?.[0],
  section,
  items_total: item.items_total,
  is_folderish: item.is_folderish || item['@type'] === 'Folder',
  '@type': item['@type'],
});

export interface UseCategoryResult extends CategoryDataType {
  isLoading: boolean;
  error: string | null;
  setorId: string;
}

/**
 * Carrega a categoria/setor a partir da API Plone (sem dados mockados)
 */
export const useCategory = (setorOverride?: string): UseCategoryResult => {
  const params = useParams<{
    category?: string;
    proReitoriaId?: string;
  }>();
  const pathname = usePathname();
  const category = params.category;
  const proReitoriaId = params.proReitoriaId;

  const [state, setState] = useState<UseCategoryResult>({
    title: '',
    editais: [],
    isLoading: true,
    error: null,
    setorId: '',
  });

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const pathCategory = pathSegments[0] || '';

    let rawKey =
      setorOverride ||
      proReitoriaId ||
      category ||
      (pathCategory in categoryToSetorMap ? pathCategory : pathSegments[1]) ||
      'prograd';

    if (pathCategory in categoryToSetorMap && !setorOverride && !proReitoriaId) {
      rawKey = pathCategory;
    }

    const setorId = resolveSetorId(rawKey);

    let cancelled = false;

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null, setorId }));

      try {
        let data = await fetchEditaisBySetor(
          `${setorId}?b_size=50&sort_on=modified&sort_order=descending&metadata_fields=created&metadata_fields=modified&metadata_fields=effective&metadata_fields=Creator&metadata_fields=items_total`
        );

        if (!data.items?.length) {
          data = await searchSetorItems(setorId, {
            b_size: 50,
            sort_on: 'modified',
            sort_order: 'descending',
          });
        }

        if (cancelled) return;

        const items = (data.items || []).map((item) =>
          mapItemToEdital(item, setorId)
        );

        setState({
          id: setorId,
          title: data.title || setorTitles[setorId] || setorId,
          description: data.description || '',
          editais: items,
          isLoading: false,
          error: null,
          setorId,
        });
      } catch (err) {
        if (cancelled) return;
        console.error('Erro ao carregar categoria:', err);
        setState({
          title: setorTitles[setorId] || setorId,
          editais: [],
          isLoading: false,
          error: 'Não foi possível carregar os editais deste setor.',
          setorId,
        });
      }
    };

    load();
    if (typeof window !== 'undefined') window.scrollTo(0, 0);

    return () => {
      cancelled = true;
    };
  }, [category, proReitoriaId, pathname, setorOverride]);

  return state;
};
