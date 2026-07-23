import { toEditalHref, toSetorHref, toSitePath } from '@/services/editalService';

export type FavoriteItem = {
  path: string;
  title: string;
  href: string;
  '@type'?: string;
  setorId?: string;
  savedAt: string;
};

export type FavoriteInput = {
  /** URL Plone (@id) ou path relativo */
  idOrUrl: string;
  title: string;
  href?: string;
  '@type'?: string;
  setorId?: string;
};

const STORAGE_PREFIX = 'ufac_editais_favorites:';
const EVENT_NAME = 'ufac-editais-favorites-changed';

export const favoritesStorageKey = (username?: string | null): string =>
  `${STORAGE_PREFIX}${username?.trim() || 'anon'}`;

const canUseStorage = (): boolean =>
  typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const normalizeFavoritePath = (idOrUrl: string): string =>
  toSitePath(idOrUrl).replace(/\/+$/, '');

/** Rota interna do portal a partir do path Plone (nunca URL www3). */
export const toFavoriteHref = (pathOrUrl: string): string => {
  const path = normalizeFavoritePath(pathOrUrl);
  if (!path) return '/';
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return toSetorHref(segments[0] || path);
  return toEditalHref(path);
};

const isInternalPortalHref = (href: string): boolean =>
  href.startsWith('/edital/') ||
  href.startsWith('/setor/') ||
  href === '/' ||
  href.startsWith('/favoritos');

const normalizeFavoriteItem = (item: FavoriteItem): FavoriteItem => {
  const path = normalizeFavoritePath(item.path || item.href || '');
  const href =
    item.href && isInternalPortalHref(item.href)
      ? item.href
      : toFavoriteHref(path || item.href || '');

  return {
    ...item,
    path: path || item.path,
    href,
  };
};

const readRaw = (key: string): FavoriteItem[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is FavoriteItem =>
          Boolean(
            item && typeof item.path === 'string' && typeof item.title === 'string'
          )
      )
      .map(normalizeFavoriteItem);
  } catch {
    return [];
  }
};

const writeRaw = (key: string, items: FavoriteItem[]) => {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { key } })
  );
};

export const listFavorites = (username?: string | null): FavoriteItem[] => {
  const items = readRaw(favoritesStorageKey(username));
  return [...items].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
};

export const hasFavorite = (
  idOrUrl: string,
  username?: string | null
): boolean => {
  const path = normalizeFavoritePath(idOrUrl);
  if (!path) return false;
  return readRaw(favoritesStorageKey(username)).some((item) => item.path === path);
};

export const toggleFavorite = (
  input: FavoriteInput,
  username?: string | null
): { added: boolean; items: FavoriteItem[] } => {
  const path = normalizeFavoritePath(input.idOrUrl || input.href || '');
  if (!path) {
    return { added: false, items: listFavorites(username) };
  }

  const key = favoritesStorageKey(username);
  const current = readRaw(key);
  const existingIndex = current.findIndex((item) => item.path === path);

  let next: FavoriteItem[];
  let added: boolean;

  if (existingIndex >= 0) {
    next = current.filter((_, i) => i !== existingIndex);
    added = false;
  } else {
    const setorId =
      input.setorId || path.split('/').filter(Boolean)[0] || undefined;
    const item: FavoriteItem = {
      path,
      title: input.title || 'Sem título',
      // Sempre rota interna — ignora href externo do Plone
      href: toFavoriteHref(path),
      '@type': input['@type'],
      setorId,
      savedAt: new Date().toISOString(),
    };
    next = [item, ...current];
    added = true;
  }

  writeRaw(key, next);
  return { added, items: listFavorites(username) };
};

export const subscribeFavorites = (
  listener: () => void
): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;

  const onCustom = () => listener();
  const onStorage = (event: StorageEvent) => {
    if (event.key?.startsWith(STORAGE_PREFIX)) listener();
  };

  window.addEventListener(EVENT_NAME, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT_NAME, onCustom);
    window.removeEventListener('storage', onStorage);
  };
};
