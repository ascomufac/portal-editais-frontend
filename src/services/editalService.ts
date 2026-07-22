/**
 * Serviço para consultar os editais da API Plone da UFAC
 * @module editalService
 */

import { apiRequest } from '@/services/apiClient';
import { BASE_URL, SITE_URL } from '@/services/ploneConfig';

export { BASE_URL, SITE_URL };

/** Mapeamento de rotas amigáveis para IDs de setor no Plone */
export const categoryToSetorMap: Record<string, string> = {
  graduacao: 'prograd',
  'pos-graduacao': 'propeg',
  extensao: 'proex',
  estudantis: 'proaes',
  pessoas: 'prodgep',
  idiomas: 'centro-idiomas',
  colegio: 'colegio-de-aplicacao',
};

/** Títulos de exibição por setor */
export const setorTitles: Record<string, string> = {
  prograd: 'Graduação',
  propeg: 'Pesquisa e Pós-graduação',
  proex: 'Extensão e Cultura',
  proaes: 'Assuntos Estudantis',
  prodgep: 'Gestão de Pessoas',
  'centro-idiomas': 'Centro de Idiomas',
  'colegio-de-aplicacao': 'Colégio de Aplicação',
  'conselho-universitario': 'Conselho Universitário',
  centros: 'Centros de Ensino',
  'cooperacao-interinstitucional': 'Cooperação Interinstitucional',
  dce: 'DCE',
  niead: 'Niead',
  nups: 'Núcleo de Processo Seletivo – NUPS',
  outros: 'Outros',
  proplan: 'Proplan',
};

const PRO_REITORIA_IDS = ['prograd', 'propeg', 'proex', 'proaes', 'prodgep'] as const;

export type ProReitoriaId = (typeof PRO_REITORIA_IDS)[number];

export const isProReitoriaId = (id: string): id is ProReitoriaId =>
  (PRO_REITORIA_IDS as readonly string[]).includes(id);

/**
 * Ordem preferencial do menu (depois de "Início", que é fixo na sidebar):
 * pró-reitorias → CAP → Centro de Idiomas → DCE → demais (ordem da API).
 */
const MENU_PRIORITY_IDS = [
  'prograd',
  'propeg',
  'proex',
  'proaes',
  'prodgep',
  'proplan',
  'colegio-de-aplicacao',
  'centro-idiomas',
  'dce',
] as const;

const normalizeMenuId = (id: string): string =>
  id
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .pop() || id.toLowerCase();

const resolveMenuPriority = (item: { id: string; title?: string }): number => {
  const id = normalizeMenuId(item.id);
  const title = (item.title || '').toLowerCase();

  const exact = (MENU_PRIORITY_IDS as readonly string[]).indexOf(id);
  if (exact >= 0) return exact;

  if (id.includes('colegio') || id === 'cap' || title.includes('colégio de aplicação') || title.includes('colegio de aplicacao')) {
    return (MENU_PRIORITY_IDS as readonly string[]).indexOf('colegio-de-aplicacao');
  }
  if (id.includes('idioma') || title.includes('centro de idiomas')) {
    return (MENU_PRIORITY_IDS as readonly string[]).indexOf('centro-idiomas');
  }
  if (id === 'dce' || title === 'dce') {
    return (MENU_PRIORITY_IDS as readonly string[]).indexOf('dce');
  }

  return -1;
};

/** Reordena itens do menu mantendo estável o que não está na lista de prioridade. */
export const sortMenuItems = <T extends { id: string; title?: string }>(items: T[]): T[] => {
  return items
    .map((item, index) => {
      const priority = resolveMenuPriority(item);
      return {
        item,
        index,
        rank: priority >= 0 ? priority : MENU_PRIORITY_IDS.length + index,
      };
    })
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ item }) => item);
};


/**
 * Converte URL absoluta do Plone em caminho relativo do site
 */
export const toSitePath = (url: string): string =>
  url.replace(SITE_URL, '').replace(/^\/+/, '');

/**
 * Monta a rota interna do portal para um item do Plone
 */
export const toEditalHref = (url: string): string => `/edital/${toSitePath(url)}`;

/**
 * Monta a rota de setor a partir de um path Plone
 */
export const toSetorHref = (urlOrId: string): string => {
  const path = toSitePath(urlOrId).split('/')[0];
  return path ? `/setor/${path}` : '/';
};

/**
 * Reescreve links absolutos do Plone (www3) para rotas internas do portal
 */
export const rewritePloneHtmlLinks = (html: string): string =>
  html
    .replace(/https?:\/\/www3\.ufac\.br\//g, '/edital/')
    .replace(/href="\/(?!edital\/|setor\/|visualizar-pdf\/|resultados-busca)/g, 'href="/edital/');

/**
 * Interface para um item do menu
 */
export interface MenuItem {
  id: string;
  title: string;
  url: string;
  href: string;
  description?: string;
  '@id'?: string;
  '@type'?: string;
  remoteUrl?: string;
  /** Subitens do @navigation Plone (accordion) */
  children?: MenuItem[];
  /** Grupo sintético (ex.: "Por ano") — não navega sozinho */
  isGroup?: boolean;
}

/** Pastas nomeadas só com ano (2026) ou "Antes 2014" */
const isYearFolderTitle = (title: string) =>
  /^\d{4}$/.test(title.trim()) || /^antes\b/i.test(title.trim());

/**
 * Agrupa pastas de ano sob um item "Por ano" para deixar a hierarquia legível.
 */
export const groupYearFolders = (items: MenuItem[], parentId: string): MenuItem[] => {
  const years: MenuItem[] = [];
  const rest: MenuItem[] = [];

  for (const item of items) {
    const withNested = item.children?.length
      ? { ...item, children: groupYearFolders(item.children, item.id) }
      : item;

    if (isYearFolderTitle(item.title)) {
      years.push(withNested);
    } else {
      rest.push(withNested);
    }
  }

  if (years.length < 2) {
    return items.map((item) =>
      item.children?.length
        ? { ...item, children: groupYearFolders(item.children, item.id) }
        : item
    );
  }

  // Anos mais recentes primeiro
  years.sort((a, b) => b.title.localeCompare(a.title, 'pt-BR', { numeric: true }));

  return [
    ...rest,
    {
      id: `${parentId}__por-ano`,
      title: 'Por ano',
      url: '',
      href: '#',
      isGroup: true,
      children: years,
    },
  ];
};

/**
 * Interface para um item de edital
 */
export interface EditalItem {
  '@id': string;
  '@type':
    | 'Folder'
    | 'Document'
    | 'File'
    | 'Image'
    | 'Link'
    | 'Collection'
    | 'Event'
    | 'News Item'
    | string;
  title: string;
  description: string;
  type_title: string;
  review_state: string | null;
  image_field: string;
  image_scales: Record<string, unknown>;
  created: string;
  modified: string;
  effective: string;
  Creator?: string;
  creators?: string[];
  items_total?: number;
  is_folderish?: boolean;
}

/**
 * Interface para a resposta da API de editais
 */
export interface EditalResponse {
  '@id': string;
  '@type':
    | 'Folder'
    | 'Document'
    | 'File'
    | 'Image'
    | 'Link'
    | 'Collection'
    | 'Event'
    | 'News Item'
    | string;
  UID: string;
  allow_discussion: boolean;
  contributors: string[];
  created: string;
  creators: string[];
  description: string;
  effective: string;
  exclude_from_nav: boolean;
  expires: string | null;
  id: string;
  is_folderish: boolean;
  items: EditalItem[];
  items_total: number;
  language: {
    title: string;
    token: string;
  };
  layout: string;
  lock: Record<string, unknown>;
  modified: string;
  nextPreviousEnabled: boolean;
  next_item?: {
    '@id': string;
    '@type': string;
    title: string;
    description: string;
    type_title: string;
  };
  parent: {
    '@id': string;
    '@type': string;
    title: string;
    description: string;
    type_title: string;
  };
  previous_item?: {
    '@id': string;
    '@type': string;
    title: string;
    description: string;
    type_title: string;
  };
  relatedItems: Record<string, unknown>[];
  review_state: string;
  rights: string | null;
  subjects: string[];
  text: string | { 'content-type'?: string; data?: string; encoding?: string } | null;
  title: string;
  type_title: string;
  version: string;
  working_copy: string | null;
  working_copy_of: string | null;
  '@components': {
    [key: string]: {
      '@id': string;
    };
  };
  batching?: {
    total: number;
    [key: string]: unknown;
  };
}

export interface SearchParams {
  portal_type?: string;
  SearchableText?: string;
  b_start?: number;
  b_size?: number;
  sort_on?: string;
  sort_order?: 'ascending' | 'descending';
  metadata_fields?: string[];
  Title?: string;
  path?: string;
  /** Autor no catálogo Plone */
  Creator?: string;
  /**
   * Filtro de data (índices Plone: created | modified | effective).
   * Usa query + range (min / max / min:max) no @search.
   */
  dateFilter?: {
    field: 'created' | 'modified' | 'effective';
    from?: string; // YYYY-MM-DD
    to?: string;   // YYYY-MM-DD
  };
}

/**
 * Anexa filtro de faixa de data no formato do catálogo Plone / plone.restapi.
 * Ex.: modified.query=2026-01-01&modified.query=2026-06-30&modified.range=min:max
 */
export const appendDateRangeParams = (
  searchParams: URLSearchParams,
  field: 'created' | 'modified' | 'effective',
  from?: string,
  to?: string
): void => {
  const hasFrom = Boolean(from?.trim());
  const hasTo = Boolean(to?.trim());
  if (!hasFrom && !hasTo) return;

  if (hasFrom && hasTo) {
    searchParams.append(`${field}.query`, from!.trim());
    searchParams.append(`${field}.query`, to!.trim());
    searchParams.append(`${field}.range`, 'min:max');
  } else if (hasFrom) {
    searchParams.append(`${field}.query`, from!.trim());
    searchParams.append(`${field}.range`, 'min');
  } else {
    searchParams.append(`${field}.query`, to!.trim());
    searchParams.append(`${field}.range`, 'max');
  }
};

const buildSearchParams = (params: SearchParams = {}): URLSearchParams => {
  const searchParams = new URLSearchParams();

  if (params.portal_type) searchParams.append('portal_type', params.portal_type);
  if (params.SearchableText) searchParams.append('SearchableText', params.SearchableText);
  if (params.Title) searchParams.append('Title', params.Title);
  if (params.path) searchParams.append('path', params.path);
  if (params.Creator) searchParams.append('Creator', params.Creator);
  if (params.b_start !== undefined) searchParams.append('b_start', String(params.b_start));
  if (params.b_size !== undefined) searchParams.append('b_size', String(params.b_size));
  if (params.sort_on) searchParams.append('sort_on', params.sort_on);
  if (params.sort_order) searchParams.append('sort_order', params.sort_order);

  if (params.dateFilter) {
    appendDateRangeParams(
      searchParams,
      params.dateFilter.field,
      params.dateFilter.from,
      params.dateFilter.to
    );
  }

  const fields = params.metadata_fields ?? [
    'created',
    'modified',
    'effective',
    'Creator',
    'items_total',
  ];
  fields.forEach((field) => searchParams.append('metadata_fields', field));

  return searchParams;
};

// Cache interno no módulo
const MENU_NAV_DEPTH = 3;
let cachedMenuItems: MenuItem[] | null = null;
let cachedNavDepth: number | null = null;

/** Invalida cache do menu */
export const clearMenuItemsCache = () => {
  cachedMenuItems = null;
  cachedNavDepth = null;
};

type PloneNavNode = {
  '@id': string;
  title: string;
  description?: string;
  items?: PloneNavNode[];
  remoteUrl?: string;
  '@type'?: string;
};

/**
 * Href interno a partir de um path Plone.
 * Raiz de setor → /setor/:id | caminho aninhado → /edital/...
 */
const hrefFromSitePath = (sitePath: string, isLink = false, remoteUrl?: string): string => {
  if (isLink) {
    const remote = remoteUrl || '';
    if (remote.includes('www3.ufac.br')) return toEditalHref(remote);
    if (remote.startsWith('http')) return remote;
    return toEditalHref(sitePath);
  }

  const segments = sitePath.split('/').filter(Boolean);
  if (segments.length <= 1) return toSetorHref(segments[0] || sitePath);
  return toEditalHref(sitePath);
};

/**
 * Converte nó do @navigation (ou item da raiz) em MenuItem
 */
const mapNavNodeToMenuItem = (node: PloneNavNode, forceLink = false): MenuItem => {
  const sitePath = toSitePath(node['@id']);
  const id = sitePath.split('/').filter(Boolean).pop() || sitePath || 'home';
  const isLink = forceLink || node['@type'] === 'Link';

  const children = (node.items || [])
    .filter((child) => {
      const childPath = toSitePath(child['@id']);
      return childPath && childPath !== '/' && child.title !== 'Home';
    })
    .map((child) => mapNavNodeToMenuItem(child));

  return {
    id,
    title: node.title,
    url: sitePath,
    href: hrefFromSitePath(sitePath, isLink, node.remoteUrl),
    description: node.description,
    '@id': node['@id'],
    '@type': node['@type'],
    remoteUrl: node.remoteUrl,
    children: children.length > 0 ? children : undefined,
  };
};

/**
 * Converte item da API Plone (raiz) em item de menu do portal
 */
const mapApiItemToMenuItem = (
  item: EditalItem & { '@id': string; remoteUrl?: string }
): MenuItem => {
  const sitePath = toSitePath(item['@id']);
  const id = sitePath.split('/').filter(Boolean).pop() || '';
  const isLink = item['@type'] === 'Link';

  return {
    id,
    title: item.title,
    url: sitePath,
    href: hrefFromSitePath(sitePath, isLink, item.remoteUrl),
    description: item.description,
    '@id': item['@id'],
    '@type': item['@type'],
    remoteUrl: item.remoteUrl,
  };
};

/**
 * Menu do portal via @navigation do Plone (com submenus) + Links extras da raiz.
 */
export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  if (cachedMenuItems && cachedNavDepth === MENU_NAV_DEPTH) {
    return cachedMenuItems;
  }

  try {
    // Navegação oficial do Plone (mesma base do portal www3)
    const nav = await apiRequest<{ items?: PloneNavNode[] }>(
      `@navigation?expand.navigation.depth=${MENU_NAV_DEPTH}`
    );

    const fromNav = (nav.items || [])
      .filter((node) => {
        const path = toSitePath(node['@id']);
        return path !== '' && path !== '/' && node.title !== 'Home';
      })
      .map((node) => mapNavNodeToMenuItem(node));

    // Complementa com itens da raiz que não entram no @navigation (ex.: Links)
    let extras: MenuItem[] = [];
    try {
      const root = await apiRequest<{
        items: Array<EditalItem & { '@id': string; remoteUrl?: string }>;
      }>('');
      const navIds = new Set(fromNav.map((i) => i.id));
      extras = (root.items || [])
        .map(mapApiItemToMenuItem)
        .filter((item) => item.id && !navIds.has(item.id));
    } catch (err) {
      console.warn('Não foi possível complementar menu com itens da raiz:', err);
    }

    // Mantém ordem do portal: pró-reitorias → CAP → idiomas → DCE → demais
    cachedMenuItems = sortMenuItems([...extras, ...fromNav]).map((item) =>
      item.children?.length
        ? { ...item, children: groupYearFolders(item.children, item.id) }
        : item
    );
    cachedNavDepth = MENU_NAV_DEPTH;
    return cachedMenuItems;
  } catch (error) {
    console.error('Erro ao buscar menu via @navigation, tentando raiz:', error);
    try {
      const data = await apiRequest<{
        items: Array<EditalItem & { '@id': string; remoteUrl?: string }>;
      }>('');
      cachedMenuItems = sortMenuItems((data.items || []).map(mapApiItemToMenuItem));
      return cachedMenuItems;
    } catch (fallbackError) {
      console.error('Erro ao buscar itens do menu:', fallbackError);
      cachedMenuItems = null;
      throw fallbackError;
    }
  }
};

/**
 * Busca apenas as pró-reitorias a partir do menu do Plone
 */
export const fetchProReitorias = async (): Promise<MenuItem[]> => {
  const items = await fetchMenuItems();
  return items.filter((item) => isProReitoriaId(item.id));
};

/**
 * Busca conteúdo de um setor (ou endpoint relativo já montado)
 */
export const fetchEditaisBySetor = async (setorId: string): Promise<EditalResponse> => {
  try {
    return await apiRequest<EditalResponse>(setorId);
  } catch (error) {
    console.error(`Erro ao buscar editais do setor "${setorId}":`, error);
    throw error;
  }
};

/**
 * Busca itens de um setor via @search
 */
export const searchSetorItems = async (
  setorId: string,
  params: SearchParams = {}
): Promise<EditalResponse> => {
  const query = buildSearchParams({
    b_start: 0,
    b_size: 50,
    sort_on: 'modified',
    sort_order: 'descending',
    ...params,
  });

  return apiRequest<EditalResponse>(`/${setorId}/@search?${query.toString()}`);
};

/**
 * Busca global no Plone
 */
export const searchSite = async (params: SearchParams = {}): Promise<EditalResponse> => {
  const query = buildSearchParams({
    b_start: 0,
    b_size: 20,
    sort_on: 'created',
    sort_order: 'descending',
    ...params,
  });

  return apiRequest<EditalResponse>(`/@search?${query.toString()}`);
};

/**
 * Editais em destaque (pastas publicadas com "Edital" no título) — alinhado ao listing do Plone
 */
export const fetchFeaturedEditais = async (limit = 6): Promise<EditalItem[]> => {
  const data = await searchSite({
    portal_type: 'Folder',
    SearchableText: 'Edital',
    b_size: limit,
    sort_on: 'created',
    sort_order: 'descending',
  });

  return data.items ?? [];
};

/**
 * Atualizações recentes (últimos itens modificados no portal)
 */
export const fetchRecentUpdates = async (limit = 8): Promise<EditalItem[]> => {
  const data = await searchSite({
    SearchableText: 'Edital',
    b_size: limit,
    sort_on: 'modified',
    sort_order: 'descending',
  });

  return data.items ?? [];
};

/**
 * Resolve o ID do setor a partir de uma rota de categoria amigável
 */
export const resolveSetorId = (categoryOrSetor: string): string =>
  categoryToSetorMap[categoryOrSetor] ?? categoryOrSetor;
