import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { modifiedAfterFromPreset } from '@/components/admin/adminSearchUtils';
import {
  TYPE_LABELS,
  adminContentHref,
  formatContentLocation,
  getContentDisplayName,
  getContentTypeLabel,
  isFolderishContent,
  parentPlonePath,
  resolveContentType,
  searchPortalContent,
  toPlonePath,
  type PloneContentItem,
} from '@/services/ploneContentService';
import {
  ChevronDown,
  FileText,
  Folder,
  Link2,
  Loader2,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const HISTORY_KEY = 'ufac-admin-search-history';
const MAX_HISTORY = 8;

export type AdminSearchFilters = {
  type: string; // all | Folder | File | ...
  creator: string; // '' | username
  modified: string; // any | today | 7d | 30d | year
};

const TYPE_OPTIONS = [
  { id: 'all', label: 'Qualquer tipo' },
  { id: 'Folder', label: 'Pasta' },
  { id: 'File', label: 'Arquivo' },
  { id: 'Document', label: 'Página' },
  { id: 'Link', label: 'Link' },
  { id: 'Image', label: 'Imagem' },
  { id: 'Collection', label: 'Coleção' },
  { id: 'NewsItem', label: 'Notícia' },
] as const;

const MODIFIED_OPTIONS = [
  { id: 'any', label: 'Qualquer data' },
  { id: 'today', label: 'Hoje' },
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
  { id: 'year', label: 'Este ano' },
] as const;

const readHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
};

const pushHistory = (term: string) => {
  const q = term.trim();
  if (!q) return;
  const next = [q, ...readHistory().filter((h) => h.toLowerCase() !== q.toLowerCase())].slice(
    0,
    MAX_HISTORY
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
};

const SuggestIcon: React.FC<{ item: PloneContentItem }> = ({ item }) => {
  const type = resolveContentType(item);
  if (isFolderishContent(item) || type === 'Folder') {
    return <Folder className="h-4 w-4 shrink-0 fill-sky-400/80 text-sky-500" />;
  }
  if (type === 'Link') {
    return <Link2 className="h-4 w-4 shrink-0 text-sky-600" />;
  }
  if (type === 'File' || type === 'Image') {
    return <FileText className="h-4 w-4 shrink-0 text-red-500" />;
  }
  return <FileText className="h-4 w-4 shrink-0 text-ufac-blue" />;
};

const chipClass = (active: boolean) =>
  cn(
    'inline-flex h-8 items-center gap-1 rounded-full border px-3 text-sm font-medium leading-none transition-colors',
    active
      ? 'border-ufac-blue bg-ufac-lightBlue text-ufac-blue'
      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
  );

type AdminSearchBarProps = {
  className?: string;
  /** Username atual (atalho “Eu” no filtro Pessoas). */
  currentUsername?: string;
};

/**
 * Busca estilo Google Drive: painel ao focar, chips Tipo/Pessoas/Modificado e autocomplete.
 */
const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  className,
  currentUsername,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [filters, setFilters] = useState<AdminSearchFilters>(() => ({
    type: searchParams.get('type') || 'all',
    creator: searchParams.get('creator') || '',
    modified: searchParams.get('modified') || 'any',
  }));
  const [history, setHistory] = useState<string[]>(() => readHistory());
  const [suggestions, setSuggestions] = useState<PloneContentItem[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [peopleDraft, setPeopleDraft] = useState('');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setFilters({
      type: searchParams.get('type') || 'all',
      creator: searchParams.get('creator') || '',
      modified: searchParams.get('modified') || 'any',
    });
  }, [searchParams]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const buildHref = useCallback(
    (q: string, nextFilters: AdminSearchFilters) => {
      const params = new URLSearchParams();
      const trimmed = q.trim();
      if (trimmed) params.set('q', trimmed);
      if (nextFilters.type && nextFilters.type !== 'all') {
        params.set('type', nextFilters.type);
      }
      if (nextFilters.creator.trim()) {
        params.set('creator', nextFilters.creator.trim());
      }
      if (nextFilters.modified && nextFilters.modified !== 'any') {
        params.set('modified', nextFilters.modified);
      }
      const qs = params.toString();
      return qs ? `/admin/conteudo?${qs}` : '/admin/conteudo';
    },
    []
  );

  const runSearch = useCallback(
    (q: string, nextFilters: AdminSearchFilters = filters) => {
      const trimmed = q.trim();
      if (trimmed) {
        pushHistory(trimmed);
        setHistory(readHistory());
      }
      setOpen(false);
      navigate(buildHref(trimmed, nextFilters));
    },
    [buildHref, filters, navigate]
  );

  // Autocomplete debounce
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2 && !filters.creator && filters.type === 'all') {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const result = await searchPortalContent({
          SearchableText: q || undefined,
          portal_type: filters.type === 'all' ? undefined : filters.type,
          Creator: filters.creator.trim() || undefined,
          modifiedAfter: modifiedAfterFromPreset(filters.modified),
          b_size: 8,
        });
        if (!cancelled) setSuggestions(result.items);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query, filters]);

  const historyMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((h) => h.toLowerCase().includes(q));
  }, [history, query]);

  const typeLabel =
    TYPE_OPTIONS.find((t) => t.id === filters.type)?.label ||
    TYPE_LABELS[filters.type] ||
    'Tipo';
  const modifiedLabel =
    MODIFIED_OPTIONS.find((m) => m.id === filters.modified)?.label || 'Modificado';
  const peopleLabel = filters.creator
    ? filters.creator === currentUsername
      ? 'Eu'
      : filters.creator
    : 'Pessoas';

  const hasFilters =
    filters.type !== 'all' ||
    Boolean(filters.creator.trim()) ||
    filters.modified !== 'any';

  const openItem = (item: PloneContentItem) => {
    const path = toPlonePath(item['@id']);
    setOpen(false);
    if (query.trim()) {
      pushHistory(query.trim());
      setHistory(readHistory());
    }
    if (isFolderishContent(item)) {
      navigate(adminContentHref(path));
      return;
    }
    navigate(adminContentHref(parentPlonePath(path)), {
      state: { focusPath: path },
    });
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/10"
          aria-hidden
          onMouseDown={() => setOpen(false)}
        />
      )}

      <div
        ref={rootRef}
        className={cn('relative z-50 mx-auto w-full max-w-2xl flex-1', className)}
      >
        {!open ? (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="flex h-12 w-full items-center gap-3 rounded-full bg-[#e9eef6] px-4 text-left transition hover:bg-[#e3eaf4]"
          >
            <Search className="h-5 w-5 shrink-0 text-slate-500" />
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-base',
                query || hasFilters ? 'text-slate-800' : 'text-slate-500'
              )}
            >
              {query ||
                (hasFilters
                  ? [typeLabel !== 'Qualquer tipo' ? typeLabel : null, peopleLabel !== 'Pessoas' ? peopleLabel : null, modifiedLabel !== 'Qualquer data' ? modifiedLabel : null]
                      .filter(Boolean)
                      .join(' · ') || 'Pesquisar editais'
                  : 'Pesquisar editais')}
            </span>
            {hasFilters && (
              <span className="hidden rounded-full bg-ufac-lightBlue px-2 py-0.5 text-[11px] font-medium text-ufac-blue sm:inline">
                Filtros
              </span>
            )}
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500"
              title="Opções de pesquisa"
            >
              <Settings2 className="h-4 w-4" />
            </span>
          </button>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-300/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSearch(query);
              }}
              className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 sm:px-4"
            >
              <Search className="h-5 w-5 shrink-0 text-slate-500" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar editais"
                autoComplete="off"
                role="combobox"
                aria-expanded
                aria-controls={listId}
                className="h-10 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Limpar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100',
                  hasFilters && 'bg-ufac-lightBlue text-ufac-blue'
                )}
                title="Filtros"
                aria-label="Filtros de pesquisa"
                onClick={() => inputRef.current?.focus()}
              >
                <Settings2 className="h-4 w-4" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={chipClass(filters.type !== 'all')}>
                    Tipo{filters.type !== 'all' ? `: ${typeLabel}` : ''}
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl">
                  {TYPE_OPTIONS.map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={() => setFilters((f) => ({ ...f, type: t.id }))}
                      className={filters.type === t.id ? 'bg-ufac-lightBlue text-ufac-blue' : ''}
                    >
                      {t.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu
                onOpenChange={(isOpen) => {
                  if (isOpen) setPeopleDraft(filters.creator);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button type="button" className={chipClass(Boolean(filters.creator))}>
                    {peopleLabel}
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
                  <DropdownMenuItem
                    onClick={() => setFilters((f) => ({ ...f, creator: '' }))}
                  >
                    Qualquer pessoa
                  </DropdownMenuItem>
                  {currentUsername && (
                    <DropdownMenuItem
                      onClick={() =>
                        setFilters((f) => ({ ...f, creator: currentUsername }))
                      }
                    >
                      Eu (@{currentUsername})
                    </DropdownMenuItem>
                  )}
                  <div
                    className="mt-1 space-y-2 border-t border-slate-100 px-1 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Login do criador
                    </p>
                    <form
                      className="flex gap-1"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setFilters((f) => ({
                          ...f,
                          creator: peopleDraft.trim(),
                        }));
                      }}
                    >
                      <Input
                        value={peopleDraft}
                        onChange={(e) => setPeopleDraft(e.target.value)}
                        placeholder="ex.: antonio"
                        className="h-8 rounded-lg text-sm"
                      />
                      <button
                        type="submit"
                        className="h-8 rounded-lg bg-ufac-blue px-3 text-sm font-medium text-white"
                      >
                        OK
                      </button>
                    </form>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={chipClass(filters.modified !== 'any')}>
                    Modificado
                    {filters.modified !== 'any' ? `: ${modifiedLabel}` : ''}
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl">
                  {MODIFIED_OPTIONS.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => setFilters((f) => ({ ...f, modified: m.id }))}
                      className={
                        filters.modified === m.id ? 'bg-ufac-lightBlue text-ufac-blue' : ''
                      }
                    >
                      {m.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasFilters && (
                <button
                  type="button"
                  className="text-sm text-slate-500 hover:text-ufac-blue"
                  onClick={() =>
                    setFilters({ type: 'all', creator: '', modified: 'any' })
                  }
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div id={listId} role="listbox" className="max-h-[min(420px,50vh)] overflow-y-auto">
              {suggestLoading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando…
                </div>
              )}

              {!suggestLoading && historyMatches.length > 0 && (
                <ul className="py-1">
                  {historyMatches.slice(0, 5).map((term) => (
                    <li key={`h-${term}`}>
                      <button
                        type="button"
                        role="option"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setQuery(term);
                          runSearch(term);
                        }}
                      >
                        <Search className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!suggestLoading && suggestions.length > 0 && (
                <ul className="border-t border-slate-100 py-1">
                  {suggestions.map((item) => {
                    const loc = formatContentLocation(item);
                    return (
                      <li key={item['@id']}>
                        <button
                          type="button"
                          role="option"
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                          onClick={() => openItem(item)}
                        >
                          <SuggestIcon item={item} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-slate-800">
                              {getContentDisplayName(item)}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {getContentTypeLabel(item)}
                              {loc ? ` · ${loc}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!suggestLoading &&
                query.trim().length >= 2 &&
                suggestions.length === 0 &&
                historyMatches.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    Nenhum resultado para “{query.trim()}”
                  </p>
                )}

              {!suggestLoading &&
                !query.trim() &&
                historyMatches.length === 0 &&
                suggestions.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    Digite para buscar ou use os filtros acima
                  </p>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5">
              <button
                type="button"
                className="text-sm font-medium text-ufac-blue hover:underline"
                onClick={() => inputRef.current?.focus()}
              >
                Pesquisa avançada
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-ufac-blue"
                onClick={() => runSearch(query)}
              >
                Todos os resultados
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSearchBar;
