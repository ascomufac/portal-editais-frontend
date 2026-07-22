import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  REVIEW_STATE_LABELS,
  getContentTypeLabel,
  getContentDisplayName,
  getReviewState,
  isFolderishContent,
  listFolderContents,
  listRecentActivity,
  parentPlonePath,
  resolveContentType,
  adminContentHref,
  toPlonePath,
  type PloneContentItem,
} from '@/services/ploneContentService';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  LayoutGrid,
  LayoutList,
  Link2,
  Loader2,
  Lock,
  MoreVertical,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RECENT_VIEW_KEY = 'ufac-admin-home-recent-view';

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
  });
};

const isUnpublished = (item: PloneContentItem) => {
  const state = getReviewState(item);
  return Boolean(state && state !== 'published');
};

const RecentIcon: React.FC<{ item: PloneContentItem; compact?: boolean }> = ({
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

const recentCardClass = (item: PloneContentItem) => {
  const privateItem = getReviewState(item) === 'private';
  const draft = isUnpublished(item) && !privateItem;
  return cn(
    'group flex h-11 w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-transparent py-1.5 pl-1.5 pr-1 text-left transition',
    privateItem
      ? 'bg-slate-100/90 hover:bg-slate-100'
      : draft
        ? 'bg-slate-50 hover:bg-slate-100/80'
        : 'bg-[#e9eef6]/80 hover:bg-[#e9eef6]'
  );
};

/**
 * Início estilo Drive: saudação + pastas sugeridas + recentes.
 */
const AdminHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.fullname || user?.username || 'Usuário';
  const firstName = displayName.split(' ')[0];
  const [folders, setFolders] = useState<PloneContentItem[]>([]);
  const [recent, setRecent] = useState<PloneContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentView, setRecentView] = useState<'list' | 'grid'>(() => {
    try {
      const saved = localStorage.getItem(RECENT_VIEW_KEY);
      return saved === 'list' || saved === 'grid' ? saved : 'grid';
    } catch {
      return 'grid';
    }
  });

  const setRecentViewMode = (mode: 'list' | 'grid') => {
    setRecentView(mode);
    try {
      localStorage.setItem(RECENT_VIEW_KEY, mode);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setRecentLoading(true);
      try {
        const [folderListing, activity] = await Promise.all([
          listFolderContents(''),
          listRecentActivity({ b_size: 12 }),
        ]);
        if (!cancelled) {
          setFolders(folderListing.items.filter(isFolderishContent).slice(0, 8));
          setRecent(activity.items.slice(0, 12));
        }
      } catch {
        if (!cancelled) {
          setFolders([]);
          setRecent([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRecentLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openRecent = (item: PloneContentItem) => {
    const path = toPlonePath(item['@id']);
    if (isFolderishContent(item)) {
      navigate(adminContentHref(path));
      return;
    }
    window.setTimeout(() => {
      navigate(adminContentHref(parentPlonePath(path)), {
        state: { focusPath: path },
      });
    }, 0);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl">
          Olá, {firstName}!
        </h1>
        <p className="mt-2 text-slate-500">
          Gerencie pastas, PDFs e links do Portal de Editais no Portal de Editais da Ufac.
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-sm font-medium text-slate-700">
            <ChevronDown className="h-4 w-4" />
            Recentes
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 rounded-full',
                  recentView === 'list' && 'bg-white text-ufac-blue shadow-sm'
                )}
                onClick={() => setRecentViewMode('list')}
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
                  recentView === 'grid' && 'bg-white text-ufac-blue shadow-sm'
                )}
                onClick={() => setRecentViewMode('grid')}
                title="Grade"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Link
              to="/admin/atividade"
              className="inline-flex items-center gap-0.5 text-sm font-medium text-ufac-blue hover:underline"
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {recentLoading ? (
          <div className="flex items-center gap-2 py-8 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando recentes…
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
            Nenhum arquivo modificado recentemente.
          </div>
        ) : recentView === 'list' ? (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {recent.map((item) => (
              <li key={item['@id']}>
                <button
                  type="button"
                  onClick={() => openRecent(item)}
                  className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 sm:px-4"
                >
                  <RecentIcon item={item} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {getContentDisplayName(item)}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {getContentTypeLabel(item)}
                      {item.Creator ? ` · ${item.Creator}` : ''}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-slate-500">
                    {formatRelative(item.modified)}
                  </time>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid w-full grid-cols-1 gap-2 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {recent.map((item) => {
              const state = getReviewState(item);
              return (
                <button
                  key={item['@id']}
                  type="button"
                  onClick={() => openRecent(item)}
                  className={recentCardClass(item)}
                  title={`${getContentDisplayName(item)} · ${formatRelative(item.modified)}`}
                >
                  <RecentIcon item={item} compact />
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
                  <MoreVertical className="h-4 w-4 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <p className="flex items-center gap-1 text-sm font-medium text-slate-700">
          <ChevronDown className="h-4 w-4" />
          Pastas sugeridas
        </p>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando…
          </div>
        ) : folders.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Nenhuma pasta na raiz. Abra{' '}
            <Link
              to="/admin/conteudo"
              className="font-medium text-ufac-blue hover:underline"
            >
              Editais
            </Link>{' '}
            para começar.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {folders.map((folder) => (
              <Link
                key={folder['@id']}
                to={adminContentHref(toPlonePath(folder['@id']))}
                className="group flex items-center gap-3 rounded-2xl bg-[#e9eef6]/80 px-4 py-3 transition hover:bg-[#e9eef6]"
              >
                <span className="relative shrink-0">
                  <Folder
                    className={cn(
                      'h-6 w-6',
                      getReviewState(folder) === 'private'
                        ? 'fill-slate-400/90 text-slate-500'
                        : 'fill-sky-400 text-sky-500'
                    )}
                  />
                  {getReviewState(folder) === 'private' && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-600">
                      <Lock
                        className="h-2 w-2 fill-none text-white"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex min-w-0 items-center gap-1.5 truncate font-medium text-slate-900">
                    <span className="truncate">{getContentDisplayName(folder)}</span>
                    {getReviewState(folder) === 'private' && (
                      <span className="shrink-0 rounded-full bg-slate-500 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                        Privado
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-500">em Editais</p>
                </div>
                <MoreVertical className="h-4 w-4 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <p className="flex items-center gap-1 text-sm font-medium text-slate-700">
          <ChevronDown className="h-4 w-4" />
          Atalhos
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full bg-ufac-blue">
            <Link to="/admin/conteudo">Abrir Editais</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to="/admin/conteudo" state={{ intent: { kind: 'upload' } }}>
              Enviar arquivos
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AdminHome;
