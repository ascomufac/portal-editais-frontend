/**
 * Administração de conteúdo via Plone REST API (++api++).
 */
import { apiRequest, ApiError } from '@/services/apiClient';
import { getAccessToken } from '@/services/authService';
import { BASE_URL, SITE_URL } from '@/services/ploneConfig';

export { ApiError };

export type PloneContentItem = {
  '@id': string;
  '@type': string;
  id?: string;
  title?: string;
  description?: string;
  Creator?: string;
  created?: string;
  modified?: string;
  effective?: string | null;
  expires?: string | null;
  is_folderish?: boolean;
  review_state?: string;
  UID?: string;
  exclude_from_nav?: boolean;
  subjects?: string[];
  remoteUrl?: string;
  text?: { data?: string; 'content-type'?: string } | string;
  file?: {
    download?: string;
    filename?: string;
    'content-type'?: string;
    size?: number;
  };
  creators?: string[];
  contributors?: string[];
  language?: { title?: string; token?: string } | string;
  items?: PloneContentItem[];
  items_total?: number;
  [key: string]: unknown;
};

export type PloneTypeInfo = {
  '@id': string;
  title: string;
  addable: boolean;
  id?: string;
};

export type PloneAction = {
  title: string;
  id: string;
  icon?: string;
};

export type PloneActionsMap = {
  object?: PloneAction[];
  object_buttons?: PloneAction[];
  user?: PloneAction[];
  portal_tabs?: PloneAction[];
  site_actions?: PloneAction[];
  [key: string]: PloneAction[] | undefined;
};

export type PloneWorkflowTransition = {
  title?: string;
  id?: string;
  '@id'?: string;
};

export type PloneWorkflowInfo = {
  state?: { title?: string; id?: string };
  transitions?: PloneWorkflowTransition[];
  history?: Array<{
    action?: string | null;
    actor?: string;
    comments?: string;
    review_state?: string;
    time?: string;
    title?: string;
  }>;
};

export type PloneHistoryActor = {
  '@id'?: string;
  id?: string;
  fullname?: string;
  username?: string;
};

export type PloneHistoryEntry = {
  '@id'?: string;
  action?: string | null;
  actor?: PloneHistoryActor | string;
  comments?: string;
  may_revert?: boolean;
  time?: string;
  transition_title?: string;
  type?: string | null;
  version?: number | string | null;
};

export type PloneSharingEntry = {
  id: string;
  type?: string;
  title?: string;
  roles?: Record<string, boolean | string>;
  disabled?: boolean | string[];
};

export type PloneSharingResponse = {
  available_roles?: Array<{ id: string; title: string }>;
  entries?: PloneSharingEntry[];
  inherit?: boolean;
};

export type BreadcrumbItem = {
  '@id': string;
  title: string;
};

export type CreateContentPayload = {
  '@type': string;
  id?: string;
  title: string;
  description?: string;
  remoteUrl?: string;
  text?: string | { 'content-type': string; data: string; encoding?: string };
  subjects?: string[];
  effective?: string | null;
  expires?: string | null;
  exclude_from_nav?: boolean;
  creators?: string[];
  contributors?: string[];
  file?: {
    data: string;
    encoding: 'base64';
    filename: string;
    'content-type': string;
  };
  [key: string]: unknown;
};

export type UpdateContentPayload = Partial<Omit<CreateContentPayload, '@type'>> & {
  id?: string;
};

/** Converte @id absoluto ou path em path relativo ao site (sem barra inicial). */
export const toPlonePath = (urlOrPath: string): string => {
  if (!urlOrPath || urlOrPath === '/') return '';
  let path = urlOrPath
    .replace(SITE_URL, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
  // remove éventuel préfixe ++api++
  path = path.replace(/^\+\+api\+\+\//, '');
  return path;
};

export const pathToApiEndpoint = (path: string): string => {
  const clean = toPlonePath(path);
  return clean ? `/${clean}` : '';
};

/** Junta path Plone com sufixo de serviço (@types, @workflow, …). */
export const withService = (path: string, service: string): string => {
  const base = pathToApiEndpoint(path);
  const svc = service.startsWith('/') ? service : `/${service}`;
  return `${base}${svc}` || svc;
};

export const adminContentHref = (path: string): string => {
  const clean = toPlonePath(path);
  return clean ? `/admin/conteudo/${clean}` : '/admin/conteudo';
};

export const getContent = async (path = ''): Promise<PloneContentItem> => {
  return apiRequest<PloneContentItem>(pathToApiEndpoint(path) || '/');
};

/** Extrai id da transição (`publish`) de `id` ou `@id` (.../@workflow/publish). */
export const getTransitionId = (
  transition?: Pick<PloneWorkflowTransition, 'id' | '@id'> | null
): string => {
  if (!transition) return '';
  if (transition.id) return transition.id;
  const href = transition['@id'] || '';
  const match = href.match(/@workflow\/([^/?#]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  const tail = href.split('/').filter(Boolean).pop();
  return tail ? decodeURIComponent(tail) : '';
};

/** Normaliza review_state (string ou { token, title }). */
export const getReviewState = (item: Pick<PloneContentItem, 'review_state'>): string => {
  const rs = item.review_state as unknown;
  if (!rs) return '';
  if (typeof rs === 'string') return rs;
  if (typeof rs === 'object' && rs !== null && 'token' in rs) {
    return String((rs as { token?: string }).token || '');
  }
  return String(rs);
};

export const REVIEW_STATE_LABELS: Record<string, string> = {
  private: 'Privado',
  published: 'Publicado',
  pending: 'Pendente',
  visible: 'Visível internamente',
  reject: 'Rejeitado',
};

export const listFolderContents = async (
  path = '',
  options: { b_size?: number; b_start?: number } = {}
): Promise<{ parent: PloneContentItem; items: PloneContentItem[] }> => {
  const { b_size = 200, b_start = 0 } = options;
  const params = new URLSearchParams();
  // @search com depth=1 inclui private quando autenticado (folder.items costuma vir do cache).
  params.append('path.depth', '1');
  params.append('metadata_fields', 'Creator');
  params.append('metadata_fields', 'modified');
  params.append('metadata_fields', 'created');
  params.append('metadata_fields', 'review_state');
  params.append('metadata_fields', 'effective');
  params.append('metadata_fields', 'is_folderish');
  params.append('b_size', String(b_size));
  params.append('b_start', String(b_start));
  params.append('sort_on', 'getObjPositionInParent');

  const parentEndpoint = pathToApiEndpoint(path) || '/';
  const searchEndpoint = withService(path, '@search');

  const [parent, search] = await Promise.all([
    apiRequest<PloneContentItem>(parentEndpoint),
    apiRequest<{ items?: PloneContentItem[] }>(`${searchEndpoint}?${params.toString()}`),
  ]);

  return { parent, items: Array.isArray(search.items) ? search.items : [] };
};

export const getBreadcrumbs = async (path = ''): Promise<BreadcrumbItem[]> => {
  try {
    const data = await apiRequest<{ items?: BreadcrumbItem[] }>(
      withService(path, '@breadcrumbs')
    );
    return data.items || [];
  } catch {
    return [];
  }
};

export const getAddableTypes = async (path = ''): Promise<PloneTypeInfo[]> => {
  try {
    const data = await apiRequest<PloneTypeInfo[] | { items?: PloneTypeInfo[] }>(
      withService(path, '@types')
    );
    const list = Array.isArray(data) ? data : data.items || [];
    return list
      .map((t) => ({
        ...t,
        id: t.id || t['@id']?.split('/').pop() || '',
      }))
      .filter((t) => t.addable !== false && t.id);
  } catch {
    return [];
  }
};

export const getActions = async (path = ''): Promise<PloneActionsMap> => {
  try {
    return await apiRequest<PloneActionsMap>(withService(path, '@actions'));
  } catch {
    return {};
  }
};

export const createContent = async (
  parentPath: string,
  payload: CreateContentPayload
): Promise<PloneContentItem> => {
  const base = pathToApiEndpoint(parentPath) || '/';
  return apiRequest<PloneContentItem>(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const updateContent = async (
  path: string,
  payload: UpdateContentPayload
): Promise<PloneContentItem> => {
  const base = pathToApiEndpoint(path) || '/';
  return apiRequest<PloneContentItem>(base, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const deleteContent = async (path: string): Promise<void> => {
  const base = pathToApiEndpoint(path) || '/';
  await apiRequest(base, { method: 'DELETE' });
};

export const getWorkflow = async (path: string): Promise<PloneWorkflowInfo> => {
  return apiRequest<PloneWorkflowInfo>(withService(path, '@workflow'));
};

/** Histórico de versões + workflow de um item. */
export const getContentHistory = async (
  path: string
): Promise<PloneHistoryEntry[]> => {
  const data = await apiRequest<PloneHistoryEntry[] | { items?: PloneHistoryEntry[] }>(
    withService(path, '@history')
  );
  if (Array.isArray(data)) return data;
  return data.items || [];
};

/** Itens modificados recentemente (aproximação de auditoria global). */
export const listRecentActivity = async (
  options: {
    b_size?: number;
    b_start?: number;
    /** Username do criador (índice Creator do catálogo). */
    Creator?: string;
    portal_type?: string | string[];
    review_state?: string;
  } = {}
): Promise<{ items: PloneContentItem[]; items_total: number }> => {
  const { b_size = 40, b_start = 0, Creator, portal_type, review_state } = options;
  const params = new URLSearchParams();
  params.append('sort_on', 'modified');
  params.append('sort_order', 'descending');
  params.append('b_size', String(b_size));
  params.append('b_start', String(b_start));
  params.append('metadata_fields', 'Creator');
  params.append('metadata_fields', 'modified');
  params.append('metadata_fields', 'created');
  params.append('metadata_fields', 'review_state');
  params.append('metadata_fields', 'is_folderish');

  if (Creator?.trim()) {
    params.append('Creator', Creator.trim());
  }
  if (portal_type) {
    const types = Array.isArray(portal_type) ? portal_type : [portal_type];
    types.forEach((t) => {
      if (t) params.append('portal_type', t);
    });
  }
  if (review_state?.trim()) {
    params.append('review_state', review_state.trim());
  }

  const data = await apiRequest<{
    items?: PloneContentItem[];
    items_total?: number;
  }>(`/@search?${params.toString()}`);

  return {
    items: Array.isArray(data.items) ? data.items : [],
    items_total: data.items_total ?? 0,
  };
};

export const transitionWorkflow = async (
  path: string,
  transition: string,
  comment?: string
): Promise<PloneWorkflowInfo> => {
  return apiRequest<PloneWorkflowInfo>(
    withService(path, `@workflow/${encodeURIComponent(transition)}`),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment ? { comment } : {}),
    }
  );
};

export const getSharing = async (path: string): Promise<PloneSharingResponse> => {
  return apiRequest<PloneSharingResponse>(withService(path, '@sharing'));
};

export const updateSharing = async (
  path: string,
  body: {
    entries?: PloneSharingEntry[];
    inherit?: boolean;
    search_term?: string;
  }
): Promise<PloneSharingResponse> => {
  return apiRequest<PloneSharingResponse>(withService(path, '@sharing'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

export const moveContent = async (
  sourcePath: string,
  targetFolderPath: string
): Promise<void> => {
  const sourceUrl = `${SITE_URL}/${toPlonePath(sourcePath)}`.replace(/\/+$/, '');
  await apiRequest(withService(targetFolderPath, '@move'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: sourceUrl }),
  });
};

export const copyContent = async (
  sourcePath: string,
  targetFolderPath: string
): Promise<void> => {
  const sourceUrl = `${SITE_URL}/${toPlonePath(sourcePath)}`.replace(/\/+$/, '');
  await apiRequest(withService(targetFolderPath, '@copy'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: sourceUrl }),
  });
};

export const renameContent = async (path: string, newId: string): Promise<PloneContentItem> => {
  return updateContent(path, { id: newId });
};

const fileToBase64 = (
  file: File,
  onProgress?: (ratio: number) => void
): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      onProgress?.(1);
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });

export type UploadProgressPhase = 'reading' | 'sending';

export const uploadFile = async (
  parentPath: string,
  file: File,
  title?: string,
  onProgress?: (percent: number, phase: UploadProgressPhase) => void
): Promise<PloneContentItem> => {
  onProgress?.(0, 'reading');
  const data = await fileToBase64(file, (ratio) => {
    // 0–55%: leitura local
    onProgress?.(Math.round(ratio * 55), 'reading');
  });

  const name = title || file.name.replace(/\.[^.]+$/, '') || file.name;
  const base = pathToApiEndpoint(parentPath) || '/';
  const body = JSON.stringify({
    '@type': 'File',
    title: name,
    file: {
      data,
      encoding: 'base64',
      filename: file.name,
      'content-type': file.type || 'application/octet-stream',
    },
  });

  onProgress?.(58, 'sending');

  // XHR para progresso real do envio
  const created = await new Promise<PloneContentItem>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}${base === '/' ? '' : base}`);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    const token = getAccessToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const ratio = event.loaded / event.total;
      onProgress?.(58 + Math.round(ratio * 40), 'sending');
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100, 'sending');
        try {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : ({} as PloneContentItem));
        } catch {
          resolve({} as PloneContentItem);
        }
        return;
      }
      let message = `Erro no upload: ${xhr.status}`;
      try {
        const err = JSON.parse(xhr.responseText);
        message =
          err?.error?.message || err?.message || message;
      } catch {
        // ignore
      }
      reject(new ApiError(message, xhr.status));
    };

    xhr.onerror = () => reject(new ApiError('Falha de rede no upload.', 0));
    xhr.send(body);
  });

  return created;
};

export const TYPE_LABELS: Record<string, string> = {
  Folder: 'Pasta',
  Document: 'Página',
  File: 'Arquivo',
  Image: 'Imagem',
  Link: 'Link',
  Collection: 'Coleção',
  Event: 'Evento',
  NewsItem: 'Notícia',
  'Plone Site': 'Site',
};
