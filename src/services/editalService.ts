/**
 * Serviço para consultar os editais da API
 * @module editalService
 */

const BASE_URL = 'https://www3.ufac.br/++api++';

const apiRequest = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  return response.json();
};

/**
 * Interface para um item do menu
 * @interface MenuItem
 * @property {string} id - Identificador único do item
 * @property {string} title - Título do item
 * @property {string} url - URL para acessar o item
 * @property {string} [description] - Descrição opcional do item
 */
export interface MenuItem {
  id: string;
  title: string;
  url: string;
  description?: string;
}

/**
 * Interface para um item de edital
 */
export interface EditalItem {
  '@id': string;
  '@type': 'Folder' | 'Document' | 'File' | 'Image' | 'Link' | 'Collection' | 'Event' | 'News Item' | string;
  title: string;
  description: string;
  type_title: string;
  review_state: string | null;
  image_field: string;
  image_scales: Record<string, unknown>;
  created: string;
  modified: string;
  effective: string;
}

/**
 * Interface para a resposta da API de editais
 * @interface EditalResponse
 */
export interface EditalResponse {
  '@id': string;
  '@type': 'Folder' | 'Document' | 'File' | 'Image' | 'Link' | 'Collection' | 'Event' | 'News Item' | string;
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
    '@type': 'Folder' | 'Document' | 'File' | 'Image' | 'Link' | 'Collection' | 'Event' | 'News Item' | string;
    title: string;
    description: string;
    type_title: string;
  };
  parent: {
    '@id': string;
    '@type': 'Folder' | 'Document' | 'File' | 'Image' | 'Link' | 'Collection' | 'Event' | 'News Item' | string;
    title: string;
    description: string;
    type_title: string;
  };
  previous_item?: {
    '@id': string;
    '@type': 'Folder' | 'Document' | 'File' | 'Image' | 'Link' | 'Collection' | 'Event' | 'News Item' | string;
    title: string;
    description: string;
    type_title: string;
  };
  relatedItems: Record<string, unknown>[];
  review_state: string;
  rights: string | null;
  subjects: string[];
  text: string | null;
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
    [key: string]: any;
  };
}

// 🔒 Cache interno no módulo
let cachedMenuItems: MenuItem[] | null = null;

/**
 * Busca os itens de menu da API de editais com cache interno
 * @returns {Promise<MenuItem[]>} - Lista de itens do menu
 */
export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  // ✅ Verifica cache antes de buscar
  if (cachedMenuItems) {
    return cachedMenuItems;
  }

  try {
    const data = await apiRequest<{ items: MenuItem[] }>('');
    
    if (data.items && Array.isArray(data.items)) {
      cachedMenuItems = data.items.map(item => ({
        id: item['@id'].split('/').pop() || '',
        title: item.title,
        url: item['@id'].replace('https://www3.ufac.br/', ''),
        description: item.description
      }));

      return cachedMenuItems;
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar itens do menu:', error);
    return [];
  }
};


/**
 * Busca os editais de um setor específico com base no setorId
 * @param {string} setorId - ID do setor (ex: "prograd", "proex", etc.)
 * @returns {Promise<EditalResponse>} - Dados dos editais do setor
 */
export const fetchEditaisBySetor = async (setorId: string): Promise<EditalResponse> => {
  try {
    const data = await apiRequest<EditalResponse>(`/${setorId}`);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar editais do setor "${setorId}":`, error);
    throw error;
  }
};
