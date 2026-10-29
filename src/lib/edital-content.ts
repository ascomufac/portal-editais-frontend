/**
 * Conteúdo de uma pasta/item de edital: mesma query e conversão no servidor
 * (HTML inicial, cacheado) e no navegador (navegação entre pastas).
 */
import type { EditalDocumentType, EditalType } from '@/types/edital';
import { rewritePloneHtmlLinks, toSitePath } from '@/services/editalService';

/** Dados serializáveis do edital (o ícone é montado no cliente). */
export type EditalInfo = Omit<EditalType, 'icon' | 'color' | 'section'>;

export type EditalBreadcrumb = { id: string; title: string };

export type EditalContent = {
  edital: EditalInfo;
  documents: EditalDocumentType[];
  /** Presente quando o item é um Link do Plone. */
  remoteUrl?: string;
};

/** Conteúdo pronto vindo do servidor para a primeira renderização. */
export type EditalPageData = {
  path: string;
  content: EditalContent;
  breadcrumbs: EditalBreadcrumb[];
};

/** Caminho Plone normalizado (sem barras nas pontas). */
export const normalizeEditalPath = (path: string): string =>
  toSitePath(path).replace(/\/+$/, '');

/** FNV-1a: tags do Next têm no máximo 256 caracteres e há caminhos maiores. */
const hashPath = (value: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
};

/** Tag de cache do conteúdo de uma pasta/item. */
export const editalCacheTag = (path: string): string => {
  const clean = normalizeEditalPath(path);
  return clean.length <= 200 ? `edital:${clean}` : `edital:#${hashPath(clean)}`;
};

/** Query do conteúdo de uma pasta de edital. */
export const editalContentQuery = (): string => {
  const searchParams = new URLSearchParams();
  searchParams.append('b_start', '0');
  searchParams.append('b_size', '100');
  searchParams.append('sort_on', 'created');
  searchParams.append('sort_order', 'descending');
  searchParams.append('metadata_fields:list', 'created');
  searchParams.append('metadata_fields:list', 'modified');
  searchParams.append('metadata_fields:list', 'Creator');
  searchParams.append('metadata_fields:list', 'items_total');
  searchParams.append('metadata_fields:list', 'item_count');
  // Não pedir `effective`: no Plone costuma vir 1969-12-31 quando não preenchido.
  return searchParams.toString();
};

const sanitizeDate = (value: unknown): string => {
  if (value == null || value === '' || value === 'None') return '';
  const raw = String(value);
  const time = Date.parse(raw);
  if (!Number.isFinite(time)) return '';
  // Plone usa ~1969-12-31 quando "Data de publicação" (effective) não foi definida
  if (new Date(time).getUTCFullYear() < 1990) return '';
  return raw;
};

const isFolderish = (item: Record<string, unknown>) =>
  item['@type'] === 'Folder' ||
  item['@type'] === 'Collection' ||
  Boolean(item.is_folderish);

/** Converte a resposta do Plone (GET do item) no formato da página. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseEditalContent = (data: any, folderParent: string | null = null): EditalContent => {
  const rawHtml =
    typeof data.text === 'object' && data.text?.data
      ? String(data.text.data)
      : typeof data.text === 'string'
        ? data.text
        : '';

  const edital: EditalInfo = {
    id: data.id || data.UID || '',
    title: data.title || '',
    description: data.description || '',
    href: data['@id'] || '',
    modified: sanitizeDate(data.modified),
    effective: sanitizeDate(data.effective),
    author: data.Creator || data.creators?.[0] || '',
    '@type': data['@type'],
    is_folderish: data.is_folderish,
    items_total: data.items_total,
    htmlContent: rawHtml ? rewritePloneHtmlLinks(rawHtml) : undefined,
  };

  const documents: EditalDocumentType[] = Array.isArray(data.items)
    ? data.items.map(
        (item: Record<string, unknown> & { '@id'?: string; '@type'?: string }) => ({
          id: String(item.id || item.UID || item['@id'] || ''),
          '@id': item['@id'] || '',
          '@type': item['@type'] || '',
          title: String(item.title || ''),
          description: String(item.description || ''),
          author: String(item.Creator || item.author || ''),
          Creator: String(item.Creator || item.author || ''),
          type: String(item['@type'] || 'Document'),
          lastModified: sanitizeDate(item.modified),
          modified: sanitizeDate(item.modified),
          created: sanitizeDate(item.created),
          effective: '',
          url: String(item['@id'] || ''),
          isFolder: isFolderish(item),
          parentId: folderParent,
        })
      )
    : [];

  return {
    edital,
    documents,
    ...(data['@type'] === 'Link' && data.remoteUrl
      ? { remoteUrl: String(data.remoteUrl) }
      : {}),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseEditalBreadcrumbs = (data: any): EditalBreadcrumb[] =>
  data && Array.isArray(data.items)
    ? data.items.map((item: { '@id'?: string; title?: string }) => ({
        id: item['@id'] || '',
        title: item.title || '',
      }))
    : [];
