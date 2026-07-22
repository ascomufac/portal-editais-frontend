import { toEditalHref, toSitePath } from '@/services/editalService';

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

const readRaw = (key: string): FavoriteItem[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FavoriteItem =>
        Boolean(item && typeof item.path === 'string' && typeof item.title === 'string')
    );
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

export const normalizeFavoritePath = (idOrUrl: string): string =>
  toSitePath(idOrUrl).replace(/\/+$/, '');

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
  const path = normalizeFavoritePath(input.idOrUrl);
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
      href: input.href || toEditalHref(path),
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
