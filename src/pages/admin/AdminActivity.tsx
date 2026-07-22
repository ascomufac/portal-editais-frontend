import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ApiError,
  REVIEW_STATE_LABELS,
  getContentTypeLabel,
  getContentDisplayName,
  getReviewState,
  isFolderishContent,
  listRecentActivity,
  parentPlonePath,
  resolveContentType,
  adminContentHref,
  toPlonePath,
  type PloneContentItem,
} from '@/services/ploneContentService';
import {
  ChevronDown,
  FileText,
  Folder,
  History,
  LayoutGrid,
  LayoutList,
  Link2,
  Loader2,
  Lock,
  RefreshCw,
  User,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ACTIVITY_VIEW_KEY = 'ufac-admin-activity-view';
const PAGE_SIZE = 60;

const TYPE_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'Folder', label: 'Pasta' },
  { id: 'File', label: 'Arquivo' },
  { id: 'Document', label: 'Página' },
  { id: 'Link', label: 'Link' },
  { id: 'Collection', label: 'Coleção' },
  { id: 'Image', label: 'Imagem' },
] as const;

const STATE_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'private', label: 'Privados' },
  { id: 'published', label: 'Publicados' },
] as const;

const isUnpublished = (item: PloneContentItem) => {
  const state = getReviewState(item);
  return Boolean(state && state !== 'published');
};

const ActivityIcon: React.FC<{ item: PloneContentItem; compact?: boolean }> = ({
  item,
  compact = false,
}) => {
  const privateItem = getReviewState(item) === 'private';
  const type = resolveContentType(item);
  const folderish = isFolderishContent(item);
  const box = compact
    ? 'flex h-8 w-8 shrink-0 items-center justify-center'
    : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg';
  const icon = 'h-5 w-5';

  if (folderish || type === 'Folder' || type === 'Plone Site' || type === 'Collection') {
    return (
      <span className={cn(box, 'relative', !compact && (privateItem ? 'bg-slate-100' : 'bg-sky-50'))}>
        <Folder
          className={cn(
            icon,
            privateItem
              ? 'fill-slate-400/90 text-slate-500'
              : 'fill-sky-400 text-sky-500'
          )}
          strokeWidth={1.5}
        />
        {privateItem && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-600">
            <Lock className="h-2 w-2 fill-none text-white" strokeWidth={2.5} aria-hidden />
          </span>
        )}
      </span>
    );
  }
  if (type === 'Link') {
    return (
      <span
        className={cn(
          box,
          'relative',
          !compact && (privateItem ? 'bg-slate-100' : 'bg-sky-50 text-sky-600')
        )}
      >
        <Link2 className={cn(icon, privateItem ? 'text-slate-500' : 'text-sky-600')} />
        {privateItem && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-600">
            <Lock className="h-2 w-2 fill-none text-white" strokeWidth={2.5} aria-hidden />
          </span>
        )}
      </span>
    );
  }
  if (type === 'File' || type === 'Image') {
    return (
      <span
        className={cn(
          box,
          'relative',
          !compact && (privateItem ? 'bg-slate-100' : 'bg-red-50 text-red-500')
        )}
      >
        <FileText className={cn(icon, privateItem ? 'text-slate-500' : 'text-red-500')} />
        {privateItem && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-600">
            <Lock className="h-2 w-2 fill-none text-white" strokeWidth={2.5} aria-hidden />
          </span>
        )}
      </span>
    );
  }
  // Document e demais: azul (diferente de Arquivo vermelho)
  return (
    <span
      className={cn(
        box,
        'relative',
        !compact && (privateItem ? 'bg-slate-100' : 'bg-ufac-lightBlue text-ufac-blue')
      )}
    >
      <FileText className={cn(icon, privateItem ? 'text-slate-500' : 'text-ufac-blue')} />
      {privateItem && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-600">
          <Lock className="h-2 w-2 fill-none text-white" strokeWidth={2.5} aria-hidden />
        </span>
      )}
    </span>
  );
};

const activityCardClass = (item: PloneContentItem) => {
  const privateItem = getReviewState(item) === 'private';
  const draft = isUnpublished(item) && !privateItem;
  return cn(
    'group flex h-11 w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-transparent py-1.5 pl-1.5 pr-2 text-left transition',
    privateItem
      ? 'bg-slate-100/90 hover:bg-slate-100'
      : draft
        ? 'bg-slate-50 hover:bg-slate-100/80'
        : 'bg-[#e9eef6]/80 hover:bg-[#e9eef6]'
  );
};

const formatRelative = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} d`;
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Feed de conteúdo modificado recentemente (auditoria aproximada).
 */
const AdminActivity: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PloneContentItem[]>([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [creatorDraft, setCreatorDraft] = useState('');
  const [knownCreators, setKnownCreators] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    try {
      const saved = localStorage.getItem(ACTIVITY_VIEW_KEY);
      return saved === 'list' || saved === 'grid' ? saved : 'list';
    } catch {
      return 'list';
    }
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchLock = useRef(false);

  const setView = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    try {
      localStorage.setItem(ACTIVITY_VIEW_KEY, mode);
    } catch {
      // ignore
    }
  };

  const mergeCreators = useCallback((list: PloneContentItem[]) => {
    setKnownCreators((prev) => {
      const next = new Set(prev);
      list.forEach((item) => {
        if (item.Creator) next.add(item.Creator);
      });
      return Array.from(next).sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      );
    });
  }, []);

  const loadPage = useCallback(
    async (bStart: number, append: boolean) => {
      if (fetchLock.current) return;
      fetchLock.current = true;
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
      }
      try {
        const { items: list, items_total } = await listRecentActivity({
          b_size: PAGE_SIZE,
          b_start: bStart,
          Creator: creatorFilter || undefined,
          portal_type: typeFilter === 'all' ? undefined : typeFilter,
          review_state: stateFilter === 'all' ? undefined : stateFilter,
        });
        setItemsTotal(items_total);
        setItems((prev) => {
          if (!append) return list;
          const seen = new Set(prev.map((i) => i['@id']));
          const extra = list.filter((i) => !seen.has(i['@id']));
          return [...prev, ...extra];
        });
        mergeCreators(list);
      } catch (err) {
        if (!append) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Não foi possível carregar as interações.'
          );
          setItems([]);
          setItemsTotal(0);
        }
      } finally {
        fetchLock.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [creatorFilter, typeFilter, stateFilter, mergeCreators]
  );

  const reload = useCallback(() => {
    setItems([]);
    setItemsTotal(0);
    void loadPage(0, false);
  }, [loadPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  const hasMore = items.length < itemsTotal;

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || fetchLock.current) return;
    void loadPage(items.length, true);
  }, [hasMore, loading, loadingMore, loadPage, items.length]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || items.length === 0) return;

    let root: Element | null = null;
    let parent: HTMLElement | null = node.parentElement;
    while (parent) {
      const { overflowY } = getComputedStyle(parent);
      if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
        root = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { root, rootMargin: '320px 0px', threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, loading, items.length, viewMode]);

  const openItem = (item: PloneContentItem) => {
    const path = toPlonePath(item['@id']);
    if (isFolderishContent(item)) {
      navigate(adminContentHref(path));
      return;
    }
    // Adia a navegação para o mouseup/click terminar (evita abrir modal na pasta).
    window.setTimeout(() => {
      navigate(adminContentHref(parentPlonePath(path)), {
        state: { focusPath: path },
      });
    }, 0);
  };

  const applyCreator = (value: string) => {
    const next = value.trim();
    setCreatorDraft(next);
    setCreatorFilter(next);
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setStateFilter('all');
    setCreatorFilter('');
    setCreatorDraft('');
  };

  const hasActiveFilters =
    typeFilter !== 'all' || stateFilter !== 'all' || Boolean(creatorFilter);

  const chipClass = (active: boolean) =>
    cn(
      'h-8 rounded-full border px-3 text-sm font-medium transition-colors',
      active
        ? 'border-ufac-blue bg-ufac-lightBlue text-ufac-blue'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    );

  const typeLabel = useMemo(
    () => TYPE_FILTERS.find((t) => t.id === typeFilter)?.label || 'Tipo',
    [typeFilter]
  );

  const totalLabel = itemsTotal.toLocaleString('pt-BR');
  const shownLabel = items.length.toLocaleString('pt-BR');

  const listFooter = (
    <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-6">
      {loadingMore && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando mais…
        </div>
      )}
      {!loadingMore && hasMore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={loadMore}
        >
          Carregar mais
        </Button>
      )}
      {!hasMore && items.length > 0 && (
        <p className="text-xs text-slate-400">Fim da lista · {totalLabel} itens</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-normal tracking-tight text-slate-900 sm:text-3xl">
            <History className="h-7 w-7 text-ufac-blue" />
            Últimas interações
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Conteúdos modificados recentemente no Portal de Editais.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => reload()}
          disabled={loading}
        >
          <RefreshCw className={cn('mr-1.5 h-4 w-4', loading && 'animate-spin')} />
          Atualizar
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={chipClass(typeFilter !== 'all')}>
              Tipo{typeFilter !== 'all' ? `: ${typeLabel}` : ''}
              <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl">
            {TYPE_FILTERS.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => setTypeFilter(t.id)}>
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={chipClass(Boolean(creatorFilter))}>
              <User className="mr-1 inline h-3.5 w-3.5" />
              {creatorFilter ? `Usuário: ${creatorFilter}` : 'Usuário'}
              <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
            <DropdownMenuItem
              onClick={() => {
                setCreatorFilter('');
                setCreatorDraft('');
              }}
            >
              Todos os usuários
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="space-y-2 px-1 pb-1 pt-1" onClick={(e) => e.stopPropagation()}>
              <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Filtrar por login
              </p>
              <form
                className="flex gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  applyCreator(creatorDraft);
                }}
              >
                <Input
                  value={creatorDraft}
                  onChange={(e) => setCreatorDraft(e.target.value)}
                  placeholder="ex.: antonio"
                  className="h-8 rounded-lg text-sm"
                />
                <Button type="submit" size="sm" className="h-8 rounded-lg px-3">
                  OK
                </Button>
              </form>
            </div>
            {knownCreators.length > 0 && (
              <>
                <DropdownMenuSeparator />
                {knownCreators.slice(0, 12).map((name) => (
                  <DropdownMenuItem key={name} onClick={() => applyCreator(name)}>
                    {name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={chipClass(stateFilter !== 'all')}>
              Visibilidade
              {stateFilter !== 'all'
                ? `: ${REVIEW_STATE_LABELS[stateFilter] || stateFilter}`
                : ''}
              <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl">
            {STATE_FILTERS.map((s) => (
              <DropdownMenuItem key={s.id} onClick={() => setStateFilter(s.id)}>
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            onClick={clearFilters}
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full',
                viewMode === 'list' && 'bg-white text-ufac-blue shadow-sm'
              )}
              onClick={() => setView('list')}
              title="Lista"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full',
                viewMode === 'grid' && 'bg-white text-ufac-blue shadow-sm'
              )}
              onClick={() => setView('grid')}
              title="Grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-slate-500">
            {loading && items.length === 0
              ? '…'
              : itemsTotal > 0
                ? `${shownLabel} de ${totalLabel}`
                : `${shownLabel} item${items.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
          <p className="font-medium">Erro ao carregar</p>
          <p className="mt-1 text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => reload()}>
            Tentar de novo
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-16 text-center text-sm text-slate-500">
          {hasActiveFilters
            ? 'Nenhum resultado com esses filtros. Tente outro usuário ou limpe os filtros.'
            : 'Nenhuma interação recente encontrada.'}
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid w-full grid-cols-1 gap-2 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {items.map((item) => {
              const state = getReviewState(item);
              return (
                <button
                  key={item['@id']}
                  type="button"
                  onClick={() => openItem(item)}
                  className={activityCardClass(item)}
                  title={`${getContentDisplayName(item)} · ${formatRelative(item.modified)}`}
                >
                  <ActivityIcon item={item} compact />
                  <div className="flex min-h-8 min-w-0 flex-1 items-center gap-1.5">
                    <p className="truncate text-sm font-medium leading-none text-slate-900">
                      {getContentDisplayName(item)}
                    </p>
                    {state && state !== 'published' && (
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white',
                          state === 'private' ? 'bg-slate-500' : 'bg-slate-400'
                        )}
                      >
                        {REVIEW_STATE_LABELS[state] || state}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {listFooter}
        </>
      ) : (
        <>
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {items.map((item) => {
              const state = getReviewState(item);
              return (
                <li key={item['@id']}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-slate-50 sm:px-4"
                  >
                    <ActivityIcon item={item} />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {getContentDisplayName(item)}
                        </p>
                        {state === 'private' && (
                          <span className="shrink-0 rounded-full bg-slate-500 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                            {REVIEW_STATE_LABELS.private}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {getContentTypeLabel(item)}
                        {item.Creator ? ` · ${item.Creator}` : ''}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-xs text-slate-500"
                      dateTime={item.modified || undefined}
                      title={item.modified || undefined}
                    >
                      {formatRelative(item.modified)}
                    </time>
                  </button>
                </li>
              );
            })}
          </ul>
          {listFooter}
        </>
      )}
    </div>
  );
};

export default AdminActivity;
