/**
 * Serviço para consultar os editais da API Plone da UFAC
 * @module editalService
 */

export const BASE_URL = 'https://www3.ufac.br/++api++';
export const SITE_URL = 'https://www3.ufac.br';

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

const apiRequest = async <T>(endpoint: string): Promise<T> => {
  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${BASE_URL}${normalized}`);
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  return response.json();
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
}

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
let cachedMenuItems: MenuItem[] | null = null;

/**
 * Busca os itens de menu da API de editais com cache interno
 */
export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  if (cachedMenuItems) {
    return cachedMenuItems;
  }

  try {
    const data = await apiRequest<{
      items: Array<EditalItem & { '@id': string; remoteUrl?: string }>;
    }>('');

    if (data.items && Array.isArray(data.items)) {
      cachedMenuItems = data.items.map((item) => {
        const id = item['@id'].split('/').pop() || '';
        const sitePath = toSitePath(item['@id']);
        // Links do Plone: abrir pelo próprio path (remoteUrl é resolvido na página)
        const href =
          item['@type'] === 'Link'
            ? toEditalHref(sitePath)
            : toSetorHref(sitePath);

        return {
          id,
          title: item.title,
          url: sitePath,
          href,
          description: item.description,
          '@id': item['@id'],
          '@type': item['@type'],
          remoteUrl: item.remoteUrl,
        };
      });

      return cachedMenuItems;
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar itens do menu:', error);
    throw error;
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
