import { cn } from '@/lib/utils';
import {
  adminContentHref,
  getContentDisplayName,
  getReviewState,
  isFolderishContent,
  listFolderContents,
  toPlonePath,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { ChevronRight, Folder, Loader2, Lock } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const EXPANDED_KEY = 'ufac-admin-folder-tree-expanded';
const CHILDREN_CACHE = new Map<string, PloneContentItem[]>();

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

const loadFolderChildren = async (path: string): Promise<PloneContentItem[]> => {
  const cacheKey = path || '__root__';
  const cached = CHILDREN_CACHE.get(cacheKey);
  if (cached) return cached;

  const listing = await listFolderContents(path, { b_size: 200, b_start: 0 });
  const folders = listing.items
    .filter((item) => isFolderishContent(item))
    .sort((a, b) =>
      getContentDisplayName(a).localeCompare(getContentDisplayName(b), 'pt-BR', {
        sensitivity: 'base',
      })
    );
  CHILDREN_CACHE.set(cacheKey, folders);
  return folders;
};

/** Invalida cache (ex.: após criar pasta). */
export const invalidateAdminFolderTreeCache = (path?: string) => {
  if (path === undefined) {
    CHILDREN_CACHE.clear();
  } else {
    CHILDREN_CACHE.delete(path || '__root__');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ufac-admin-tree-invalidate', { detail: { path } })
    );
  }
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
}) => {
  const [children, setChildren] = useState<PloneContentItem[] | null>(() => {
    const cached = CHILDREN_CACHE.get(path || '__root__');
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
  const isPrivate = reviewState === 'private';

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
          {isRoot ? (
            <Folder className="h-4 w-4 shrink-0 fill-sky-400/90 text-sky-500" />
          ) : (
            <span className="relative shrink-0">
              <Folder
                className={cn(
                  'h-4 w-4',
                  isPrivate
                    ? 'fill-slate-400/90 text-slate-500'
                    : 'fill-sky-400/90 text-sky-500'
                )}
              />
              {isPrivate && (
                <Lock
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 text-slate-600"
                  strokeWidth={3}
                  aria-hidden
                />
              )}
            </span>
          )}
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
          {children?.map((child) => {
            const childPath = toPlonePath(child['@id']);
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
              />
            );
          })}
          {!loading && children && children.length === 0 && !error && (
            <p
              className="py-1 text-xs text-slate-400"
              style={{ paddingLeft: paddingLeft + 28 }}
            >
              Sem subpastas
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
 * Navegação em árvore de pastas (estilo Google Drive / Meu Drive).
 */
const AdminFolderTree: React.FC<AdminFolderTreeProps> = ({
  onRootExpandedChange,
}) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Set<string>>(() => readExpanded());

  const currentPath = useMemo(() => {
    const prefix = '/admin/conteudo';
    if (!location.pathname.startsWith(prefix)) return '';
    const rest = location.pathname.slice(prefix.length).replace(/^\//, '');
    return toPlonePath(rest);
  }, [location.pathname]);

  const rootExpanded = expanded.has('');

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
        }
      }
      writeExpanded(next);
      return next;
    });
  }, [currentPath, location.pathname]);

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
      />
    </div>
  );
};

export default AdminFolderTree;
