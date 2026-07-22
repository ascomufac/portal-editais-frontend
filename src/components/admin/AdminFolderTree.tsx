import { cn } from '@/lib/utils';
import AdminDriveIcon from '@/components/admin/AdminDriveIcon';
import {
  isImportantAdminSidebarFolder,
  sortMenuItems,
} from '@/services/editalService';
import {
  adminContentHref,
  contentIdFromAtId,
  getContentDisplayName,
  getReviewState,
  isFolderishContent,
  listFolderContents,
  parentPlonePath,
  toPlonePath,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { ChevronRight, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const EXPANDED_KEY = 'ufac-admin-folder-tree-expanded';
const CHILDREN_CACHE = new Map<string, PloneContentItem[]>();
const CACHE_VERSION = 'v2-files';

const cacheKeyFor = (path: string) => `${path || '__root__'}::${CACHE_VERSION}`;

const readExpanded = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(EXPANDED_KEY);
    if (!raw) return new Set(['']);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set(['']);
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set(['']);
  }
};

const writeExpanded = (set: Set<string>) => {
  sessionStorage.setItem(EXPANDED_KEY, JSON.stringify([...set]));
};

/** Filhos da pasta: pastas primeiro, depois arquivos/links/páginas. */
const loadFolderChildren = async (path: string): Promise<PloneContentItem[]> => {
  const cacheKey = cacheKeyFor(path);
  const cached = CHILDREN_CACHE.get(cacheKey);
  if (cached) return cached;

  const listing = await listFolderContents(path, { b_size: 200, b_start: 0 });
  const items = [...listing.items].sort((a, b) => {
    const af = isFolderishContent(a) ? 0 : 1;
    const bf = isFolderishContent(b) ? 0 : 1;
    if (af !== bf) return af - bf;
    return getContentDisplayName(a).localeCompare(getContentDisplayName(b), 'pt-BR', {
      sensitivity: 'base',
    });
  });
  CHILDREN_CACHE.set(cacheKey, items);
  return items;
};

const folderMenuId = (item: PloneContentItem) =>
  item.id || contentIdFromAtId(item['@id']) || toPlonePath(item['@id']);

/** Invalida cache (ex.: após criar pasta). */
export const invalidateAdminFolderTreeCache = (path?: string) => {
  if (path === undefined) {
    CHILDREN_CACHE.clear();
  } else {
    CHILDREN_CACHE.delete(cacheKeyFor(path));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ufac-admin-tree-invalidate', { detail: { path } })
    );
  }
};

type FileLeafProps = {
  item: PloneContentItem;
  depth: number;
  currentPath: string;
};

/** Arquivo/página/link — folha sem expandir. */
const FileLeaf: React.FC<FileLeafProps> = ({ item, depth, currentPath }) => {
  const path = toPlonePath(item['@id']);
  const parentPath = parentPlonePath(path);
  const isExact = currentPath === path;
  const label = getContentDisplayName(item);
  const paddingLeft = 8 + depth * 12;

  return (
    <div
      className={cn(
        'group flex min-w-0 items-center gap-0.5 rounded-full pr-2 text-sm font-medium transition-colors',
        isExact
          ? 'bg-ufac-lightBlue text-ufac-blue'
          : 'text-slate-700 hover:bg-slate-100'
      )}
      style={{ paddingLeft }}
    >
      <span className="flex h-7 w-7 shrink-0" aria-hidden />
      <Link
        to={adminContentHref(parentPath)}
        state={{ focusPath: path }}
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5"
        title={label}
      >
        <AdminDriveIcon item={item} compact />
        <span className="truncate">{label}</span>
      </Link>
    </div>
  );
};

type TreeNodeProps = {
  path: string;
  label: string;
  depth: number;
  currentPath: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  isRoot?: boolean;
  reviewState?: string;
  item?: PloneContentItem;
  /** Paths de filhos a ocultar (ex.: atalhos fixos abaixo de Editais). */
  excludeChildPaths?: Set<string>;
};

const TreeNode: React.FC<TreeNodeProps> = ({
  path,
  label,
  depth,
  currentPath,
  expanded,
  onToggle,
  isRoot = false,
  reviewState,
  item,
  excludeChildPaths,
}) => {
  const [children, setChildren] = useState<PloneContentItem[] | null>(() => {
    const cached = CHILDREN_CACHE.get(cacheKeyFor(path));
    return cached ?? null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isExpanded = expanded.has(path);
  const href = adminContentHref(path);
  const isActive =
    currentPath === path ||
    (path !== '' && currentPath.startsWith(`${path}/`));
  const isExact = currentPath === path;
  const iconItem: PloneContentItem = item || {
    '@id': path ? `plone://${path}` : 'plone://',
    '@type': 'Folder',
    title: label,
    is_folderish: true,
    review_state: reviewState,
  };

  const visibleChildren = useMemo(() => {
    if (!children) return null;
    if (!excludeChildPaths?.size) return children;
    return children.filter(
      (child) => !excludeChildPaths.has(toPlonePath(child['@id']))
    );
  }, [children, excludeChildPaths]);

  useEffect(() => {
    const onInvalidate = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string }>).detail;
      const target = detail?.path;
      if (target === undefined || target === path) {
        setChildren(null);
      }
    };
    window.addEventListener('ufac-admin-tree-invalidate', onInvalidate);
    return () =>
      window.removeEventListener('ufac-admin-tree-invalidate', onInvalidate);
  }, [path]);

  useEffect(() => {
    if (!isExpanded) return;
    if (children) return;

    let cancelled = false;
    setLoading(true);
    setError(false);
    void loadFolderChildren(path)
      .then((items) => {
        if (!cancelled) setChildren(items);
      })
      .catch(() => {
        if (!cancelled) {
          setChildren([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isExpanded, path, children]);

  const paddingLeft = 8 + depth * 12;

  return (
    <div className="min-w-0">
      <div
        className={cn(
          'group flex min-w-0 items-center gap-0.5 rounded-full pr-2 text-sm font-medium transition-colors',
          isExact
            ? 'bg-ufac-lightBlue text-ufac-blue'
            : isActive
              ? 'text-slate-800'
              : 'text-slate-700 hover:bg-slate-100'
        )}
        style={{ paddingLeft }}
      >
        <button
          type="button"
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-black/5 hover:text-slate-600',
            isExpanded && 'text-slate-600'
          )}
          aria-label={isExpanded ? 'Recolher' : 'Expandir'}
          aria-expanded={isExpanded}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(path);
          }}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          )}
        </button>

        <Link
          to={href}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5"
          title={label}
        >
          <AdminDriveIcon item={iconItem} compact />
          <span className="truncate">{label}</span>
        </Link>
      </div>

      {isExpanded && (
        <div className="min-w-0">
          {error && (
            <p
              className="py-1 text-xs text-slate-400"
              style={{ paddingLeft: paddingLeft + 28 }}
            >
              Não foi possível carregar
            </p>
          )}
          {visibleChildren?.map((child) => {
            const childPath = toPlonePath(child['@id']);
            if (!isFolderishContent(child)) {
              return (
                <FileLeaf
                  key={child['@id']}
                  item={child}
                  depth={depth + 1}
                  currentPath={currentPath}
                />
              );
            }
            return (
              <TreeNode
                key={child['@id']}
                path={childPath}
                label={getContentDisplayName(child)}
                depth={depth + 1}
                currentPath={currentPath}
                expanded={expanded}
                onToggle={onToggle}
                reviewState={getReviewState(child)}
                item={child}
              />
            );
          })}
          {!loading &&
            visibleChildren &&
            visibleChildren.length === 0 &&
            !error && (
              <p
                className="py-1 text-xs text-slate-400"
                style={{ paddingLeft: paddingLeft + 28 }}
              >
                Pasta vazia
              </p>
            )}
        </div>
      )}
    </div>
  );
};

type AdminFolderTreeProps = {
  /** Notifica se a raiz “Editais” está expandida (para recolher a sidebar). */
  onRootExpandedChange?: (expanded: boolean) => void;
};

/**
 * Navegação em árvore (pastas + arquivos) estilo Google Drive.
 * Abaixo de Editais: atalhos fixos das pró-reitorias, CAP e Centro de Idiomas.
 */
const AdminFolderTree: React.FC<AdminFolderTreeProps> = ({
  onRootExpandedChange,
}) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Set<string>>(() => readExpanded());
  const [pinnedFolders, setPinnedFolders] = useState<PloneContentItem[]>([]);

  const currentPath = useMemo(() => {
    const prefix = '/admin/conteudo';
    if (!location.pathname.startsWith(prefix)) return '';
    const rest = location.pathname.slice(prefix.length).replace(/^\//, '');
    return toPlonePath(rest);
  }, [location.pathname]);

  const rootExpanded = expanded.has('');

  const pinnedPaths = useMemo(
    () => new Set(pinnedFolders.map((f) => toPlonePath(f['@id']))),
    [pinnedFolders]
  );

  const loadPinned = useCallback(async () => {
    try {
      const items = await loadFolderChildren('');
      const important = items
        .filter((item) => isFolderishContent(item))
        .filter((item) =>
          isImportantAdminSidebarFolder({
            id: folderMenuId(item),
            title: getContentDisplayName(item),
          })
        );
      setPinnedFolders(
        sortMenuItems(
          important.map((item) => ({
            ...item,
            id: folderMenuId(item),
            title: getContentDisplayName(item),
          }))
        )
      );
    } catch {
      setPinnedFolders([]);
    }
  }, []);

  useEffect(() => {
    void loadPinned();
  }, [loadPinned]);

  useEffect(() => {
    const onInvalidate = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string }>).detail;
      if (detail?.path === undefined || detail.path === '') {
        void loadPinned();
      }
    };
    window.addEventListener('ufac-admin-tree-invalidate', onInvalidate);
    return () =>
      window.removeEventListener('ufac-admin-tree-invalidate', onInvalidate);
  }, [loadPinned]);

  useEffect(() => {
    onRootExpandedChange?.(rootExpanded);
  }, [rootExpanded, onRootExpandedChange]);

  // Expande ancestrais do caminho atual (só ao navegar em /conteudo)
  useEffect(() => {
    if (!location.pathname.startsWith('/admin/conteudo')) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(''); // raiz
      if (currentPath) {
        const parts = currentPath.split('/').filter(Boolean);
        let acc = '';
        for (const part of parts) {
          acc = acc ? `${acc}/${part}` : part;
          const parent = acc.includes('/')
            ? acc.slice(0, acc.lastIndexOf('/'))
            : '';
          next.add(parent);
          if (pinnedPaths.has(acc)) next.add(acc);
        }
      }
      writeExpanded(next);
      return next;
    });
  }, [currentPath, location.pathname, pinnedPaths]);

  const onToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      writeExpanded(next);
      return next;
    });
  }, []);

  return (
    <div className="hidden min-w-0 sm:block">
      <TreeNode
        path=""
        label="Editais"
        depth={0}
        currentPath={currentPath}
        expanded={expanded}
        onToggle={onToggle}
        isRoot
        excludeChildPaths={pinnedPaths}
      />

      {pinnedFolders.length > 0 && (
        <div className="mt-0.5 min-w-0">
          {pinnedFolders.map((folder) => {
            const path = toPlonePath(folder['@id']);
            return (
              <TreeNode
                key={folder['@id']}
                path={path}
                label={getContentDisplayName(folder)}
                depth={0}
                currentPath={currentPath}
                expanded={expanded}
                onToggle={onToggle}
                reviewState={getReviewState(folder)}
                item={folder}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminFolderTree;
