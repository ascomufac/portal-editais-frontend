/**
 * Administração de conteúdo via Plone REST API (++api++).
 */
import { apiRequest, apiFetch, ApiError } from '@/services/apiClient';
import { ensureAuthCookies, getAccessToken } from '@/services/authService';
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
  /** Presente em alguns resultados de @search quando @type falta. */
  portal_type?: string;
  type_title?: string;
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
  title?: string;
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

/** Tipos que nunca são pastas (mesmo se o catálogo mandar is_folderish errado). */
const NON_FOLDERISH_TYPES = new Set([
  'File',
  'Image',
  'Document',
  'Link',
  'Event',
  'News Item',
  'NewsItem',
]);

const FOLDERISH_TYPES = new Set(['Folder', 'Collection', 'Plone Site']);

/** Resolve @type (com fallback para portal_type do catálogo). */
export const resolveContentType = (
  item: Pick<PloneContentItem, '@type' | 'portal_type'> | null | undefined
): string => {
  if (!item) return '';
  const raw = item['@type'] || item.portal_type || '';
  return typeof raw === 'string' ? raw : '';
};

/** Último segmento do @id (nome do objeto no Plone / nome do arquivo). */
export const contentIdFromAtId = (atId?: string | null): string => {
  if (!atId) return '';
  try {
    const path = toPlonePath(atId);
    const segment = path.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(segment);
  } catch {
    const tail = atId.split('/').filter(Boolean).pop() || '';
    try {
      return decodeURIComponent(tail);
    } catch {
      return tail;
    }
  }
};

/**
 * Nome para exibição: title → id → segmento do @id → rótulo do tipo.
 * Evita linhas em branco quando o Plone manda title: "".
 */
export const getContentDisplayName = (
  item:
    | Pick<PloneContentItem, 'title' | 'id' | '@id' | '@type' | 'portal_type' | 'type_title' | 'is_folderish'>
    | null
    | undefined
): string => {
  if (!item) return 'Sem nome';
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (title) return title;
  const id = typeof item.id === 'string' ? item.id.trim() : '';
  if (id) return id;
  const fromPath = contentIdFromAtId(item['@id']);
  if (fromPath) return fromPath;
  return getContentTypeLabel(item);
};

/** Garante @type e id preenchidos nos itens vindos de @search. */
export const normalizeContentItem = (item: PloneContentItem): PloneContentItem => {
  const type = resolveContentType(item);
  const id = (item.id || '').trim() || contentIdFromAtId(item['@id']);
  const next: PloneContentItem = { ...item };
  let changed = false;
  if (type && item['@type'] !== type) {
    next['@type'] = type;
    changed = true;
  }
  if (id && item.id !== id) {
    next.id = id;
    changed = true;
  }
  return changed ? next : item;
};

/**
 * Só pastas/coleções são navegáveis no admin.
 * Ignora is_folderish em tipos de arquivo/página (metadado do catálogo às vezes vem errado).
 */
export const isFolderishContent = (
  item:
    | Pick<PloneContentItem, '@type' | 'portal_type' | 'is_folderish'>
    | null
    | undefined
): boolean => {
  if (!item) return false;
  const type = resolveContentType(item);
  if (type && NON_FOLDERISH_TYPES.has(type)) return false;
  if (type && FOLDERISH_TYPES.has(type)) return true;
  return item.is_folderish === true;
};

/** Pasta pai de um path Plone (`a/b/c` → `a/b`). */
export const parentPlonePath = (path: string): string => {
  const clean = toPlonePath(path);
  if (!clean.includes('/')) return '';
  return clean.split('/').slice(0, -1).join('/');
};

/** Segmentos do path pai (sem o próprio item), já decodificados. */
export const getParentPathSegments = (urlOrPath?: string | null): string[] => {
  if (!urlOrPath) return [];
  const parts = toPlonePath(urlOrPath).split('/').filter(Boolean);
  if (parts.length <= 1) return [];
  return parts.slice(0, -1).map((seg) => {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  });
};

/**
 * Localização legível para listas recentes (estilo Drive).
 * Usa ids do path — sem round-trip à API.
 */
export const getContentLocationLabel = (
  item: Pick<PloneContentItem, '@id'> | null | undefined,
  options: { maxSegments?: number } = {}
): string => {
  const { maxSegments = 3 } = options;
  const segments = getParentPathSegments(item?.['@id']);
  if (segments.length === 0) return 'Raiz';
  const visible =
    segments.length > maxSegments ? segments.slice(-maxSegments) : segments;
  const joined = visible.join(' › ');
  return segments.length > maxSegments ? `… › ${joined}` : joined;
};

/** Prefixo "em …" / "na raiz" para subtítulos de recentes. */
export const formatContentLocation = (
  item: Pick<PloneContentItem, '@id'> | null | undefined
): string => {
  const label = getContentLocationLabel(item);
  return label === 'Raiz' ? 'na raiz' : `em ${label}`;
};

/**
 * Pasta imediata (coluna "Local" do Drive): rótulo + path para navegar.
 */
export const getImmediateParentLocation = (
  item: Pick<PloneContentItem, '@id'> | null | undefined
): { path: string; label: string; fullPath: string } => {
  const atId = item?.['@id'] || '';
  const path = parentPlonePath(toPlonePath(atId));
  const segments = getParentPathSegments(atId);
  const fullPath = segments.join(' / ');
  if (segments.length === 0) {
    return { path: '', label: 'Editais', fullPath: '' };
  }
  return {
    path,
    label: segments[segments.length - 1],
    fullPath,
  };
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
  options: {
    b_size?: number;
    b_start?: number;
    portal_type?: string;
    review_state?: string;
    SearchableText?: string;
    Creator?: string;
    /** ISO date — itens com modified >= valor */
    modifiedAfter?: string;
    /** Se true, pesquisa na subárvore (sem depth=1). */
    deep?: boolean;
  } = {}
): Promise<{
  parent: PloneContentItem;
  items: PloneContentItem[];
  items_total: number;
}> => {
  const {
    b_size = 60,
    b_start = 0,
    portal_type,
    review_state,
    SearchableText,
    Creator,
    modifiedAfter,
    deep = false,
  } = options;
  const params = new URLSearchParams();
  // @search com depth=1 inclui private quando autenticado (folder.items costuma vir do cache).
  const useDeep =
    deep ||
    Boolean(SearchableText?.trim()) ||
    Boolean(Creator?.trim()) ||
    Boolean(modifiedAfter?.trim());
  if (!useDeep) {
    params.append('path.depth', '1');
  }
  params.append('metadata_fields', 'Creator');
  params.append('metadata_fields', 'modified');
  params.append('metadata_fields', 'created');
  params.append('metadata_fields', 'review_state');
  params.append('metadata_fields', 'effective');
  params.append('metadata_fields', 'is_folderish');
  params.append('metadata_fields', 'portal_type');
  params.append('b_size', String(b_size));
  params.append('b_start', String(b_start));
  params.append(
    'sort_on',
    useDeep ? 'modified' : 'getObjPositionInParent'
  );
  if (useDeep) {
    params.append('sort_order', 'descending');
  }

  if (portal_type?.trim()) {
    params.append('portal_type', portal_type.trim());
  }
  if (review_state?.trim()) {
    params.append('review_state', review_state.trim());
  }
  if (SearchableText?.trim()) {
    params.append('SearchableText', SearchableText.trim());
  }
  if (Creator?.trim()) {
    params.append('Creator', Creator.trim());
  }
  if (modifiedAfter?.trim()) {
    params.append('modified.query', modifiedAfter.trim());
    params.append('modified.range', 'min');
  }

  const parentEndpoint = pathToApiEndpoint(path) || '/';
  const searchEndpoint = withService(path, '@search');

  const [parent, search] = await Promise.all([
    apiRequest<PloneContentItem>(parentEndpoint),
    apiRequest<{ items?: PloneContentItem[]; items_total?: number }>(
      `${searchEndpoint}?${params.toString()}`
    ),
  ]);

  return {
    parent: normalizeContentItem(parent),
    items: Array.isArray(search.items) ? search.items.map(normalizeContentItem) : [],
    items_total: search.items_total ?? 0,
  };
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
    review_state?: string | string[];
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
  params.append('metadata_fields', 'portal_type');

  if (Creator?.trim()) {
    params.append('Creator', Creator.trim());
  }
  if (portal_type) {
    const types = Array.isArray(portal_type) ? portal_type : [portal_type];
    types.forEach((t) => {
      if (t) params.append('portal_type', t);
    });
  }
  if (review_state) {
    const states = Array.isArray(review_state) ? review_state : [review_state];
    states.forEach((s) => {
      if (s?.trim()) params.append('review_state', s.trim());
    });
  }

  const data = await apiRequest<{
    items?: PloneContentItem[];
    items_total?: number;
  }>(`/@search?${params.toString()}`);

  return {
    items: Array.isArray(data.items) ? data.items.map(normalizeContentItem) : [],
    items_total: data.items_total ?? 0,
  };
};

/**
 * Busca global no portal (autocomplete / resultados estilo Drive).
 * Sem path.depth: pesquisa em toda a árvore (ou sob `path` se informado).
 */
export const searchPortalContent = async (
  options: {
    SearchableText?: string;
    portal_type?: string | string[];
    Creator?: string;
    /** ISO date — itens com modified >= valor */
    modifiedAfter?: string;
    path?: string;
    b_size?: number;
    b_start?: number;
  } = {}
): Promise<{ items: PloneContentItem[]; items_total: number }> => {
  const {
    SearchableText,
    portal_type,
    Creator,
    modifiedAfter,
    path = '',
    b_size = 20,
    b_start = 0,
  } = options;

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
  params.append('metadata_fields', 'portal_type');

  if (SearchableText?.trim()) {
    params.append('SearchableText', SearchableText.trim());
  }
  if (Creator?.trim()) {
    params.append('Creator', Creator.trim());
  }
  if (portal_type) {
    const types = Array.isArray(portal_type) ? portal_type : [portal_type];
    types.forEach((t) => {
      if (t?.trim()) params.append('portal_type', t.trim());
    });
  }
  if (modifiedAfter?.trim()) {
    params.append('modified.query', modifiedAfter.trim());
    params.append('modified.range', 'min');
  }

  const endpoint = path.trim()
    ? `${withService(path, '@search')}?${params.toString()}`
    : `/@search?${params.toString()}`;

  const data = await apiRequest<{
    items?: PloneContentItem[];
    items_total?: number;
  }>(endpoint);

  return {
    items: Array.isArray(data.items) ? data.items.map(normalizeContentItem) : [],
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

/**
 * Reordena um item dentro da pasta (PATCH ordering do Plone).
 * delta: "top" | "bottom" | número (positivo = desce, negativo = sobe).
 */
export const reorderFolderItem = async (
  folderPath: string,
  objId: string,
  delta: 'top' | 'bottom' | number,
  subsetIds?: string[]
): Promise<void> => {
  const base = pathToApiEndpoint(folderPath) || '/';
  await apiRequest(base, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ordering: {
        obj_id: objId,
        delta,
        ...(subsetIds && subsetIds.length > 0 ? { subset_ids: subsetIds } : {}),
      },
    }),
  });
};

export const renameContent = async (path: string, newId: string): Promise<PloneContentItem> => {
  return updateContent(path, { id: newId });
};

/**
 * Baixa um File/Image autenticado e dispara o save no navegador.
 */
export const downloadPloneFile = async (
  item: Pick<PloneContentItem, '@id' | 'title' | 'id' | 'file'>
): Promise<void> => {
  const path = toPlonePath(item['@id']);
  if (!path) throw new ApiError('Caminho do arquivo inválido.', 400);

  let res = await apiFetch(`/${path}/@download`, {
    headers: { Accept: '*/*' },
  });

  if (!res.ok) {
    ensureAuthCookies();
    const token = getAccessToken();
    const headers = new Headers({ Accept: '*/*' });
    if (token) headers.set('Authorization', `Bearer ${token}`);
    res = await fetch(`/__plone__/${path}/@@download/file`, {
      credentials: 'same-origin',
      headers,
    });
  }

  if (!res.ok) {
    throw new ApiError(`Falha ao baixar (${res.status})`, res.status);
  }

  const blob = await res.blob();
  if (!blob.size) throw new ApiError('Arquivo vazio.', 422);

  const fileMeta = item.file;
  const filename =
    (fileMeta && typeof fileMeta === 'object' && fileMeta.filename
      ? String(fileMeta.filename)
      : '') ||
    getContentDisplayName(item as PloneContentItem) ||
    item.id ||
    'download';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
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

export const getContentTypeLabel = (
  item:
    | Pick<PloneContentItem, '@type' | 'portal_type' | 'type_title' | 'is_folderish'>
    | null
    | undefined
): string => {
  if (!item) return 'Item';
  // Preferir type_title do Plone (já localizado: Pasta, Arquivo, Página…).
  const typeTitle =
    typeof item.type_title === 'string' ? item.type_title.trim() : '';
  if (typeTitle) return typeTitle;
  const type = resolveContentType(item);
  if (type && TYPE_LABELS[type]) return TYPE_LABELS[type];
  if (isFolderishContent(item)) return 'Pasta';
  return type || 'Item';
};
