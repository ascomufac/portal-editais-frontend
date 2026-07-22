import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminFilePreviewPanel from '@/components/admin/AdminFilePreviewPanel';
import AdminDriveIcon from '@/components/admin/AdminDriveIcon';
import ContentEditorDialog from '@/components/admin/ContentEditorDialog';
import HistoryDialog from '@/components/admin/HistoryDialog';
import SelectionToolbar, { type SortKey } from '@/components/admin/SelectionToolbar';
import { modifiedAfterFromPreset } from '@/components/admin/adminSearchUtils';
import { invalidateAdminFolderTreeCache } from '@/components/admin/AdminFolderTree';
import SharingDialog from '@/components/admin/SharingDialog';
import UploadFileDialog from '@/components/admin/UploadFileDialog';
import {
  adminDriveMenuContentClass,
  adminDriveMenuDangerItemClass,
  adminDriveMenuIconClass,
  adminDriveMenuItemClass,
  adminDriveMenuSeparatorClass,
} from '@/components/admin/adminDriveMenuStyles';
import { cn } from '@/lib/utils';
import type { AdminCreateIntent } from '@/pages/admin/AdminShell';
import {
  clearClipboard,
  readClipboard,
  writeClipboard,
  type ClipboardPayload,
} from '@/services/adminClipboard';
import {
  ApiError,
  REVIEW_STATE_LABELS,
  TYPE_LABELS,
  adminContentHref,
  copyContent,
  deleteContent,
  downloadPloneFile,
  getAddableTypes,
  getBreadcrumbs,
  getReviewState,
  getTransitionId,
  getWorkflow,
  getContentTypeLabel,
  getContentDisplayName,
  isFolderishContent,
  listFolderContents,
  moveContent,
  parentPlonePath,
  renameContent,
  reorderFolderItem,
  resolveContentType,
  toPlonePath,
  transitionWorkflow,
  type BreadcrumbItem,
  type PloneContentItem,
  type PloneTypeInfo,
  type PloneWorkflowInfo,
  type PloneWorkflowTransition,
} from '@/services/ploneContentService';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Folder,
  History,
  LayoutGrid,
  LayoutList,
  Link2,
  Loader2,
  Lock,
  MoreVertical,
  Pencil,
  RefreshCw,
  Scissors,
  Share2,
  Trash2,
  Upload,
  Workflow,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PAGE_SIZE = 60;

const canViewContent = (item: PloneContentItem) => {
  const type = resolveContentType(item);
  return type === 'File' || type === 'Image' || type === 'Link' || type === 'Document';
};

const canDownloadContent = (item: PloneContentItem) => {
  const type = resolveContentType(item);
  return type === 'File' || type === 'Image';
};

const isUnpublished = (item: PloneContentItem) => {
  const state = getReviewState(item);
  return Boolean(state && state !== 'published');
};

const isPublished = (item: PloneContentItem) => getReviewState(item) === 'published';

const findPublishTransition = (transitions?: PloneWorkflowTransition[]) =>
  transitions?.find((t) => {
    const id = getTransitionId(t);
    const title = (t.title || '').toLowerCase();
    return (
      id === 'publish' ||
      id === 'publish_internally' ||
      title === 'publicar' ||
      title.includes('publish')
    );
  });

const findRetractTransition = (transitions?: PloneWorkflowTransition[]) =>
  transitions?.find((t) => {
    const id = getTransitionId(t);
    const title = (t.title || '').toLowerCase();
    return (
      id === 'retract' ||
      id === 'reject' ||
      id === 'hide' ||
      title.includes('retirar') ||
      title.includes('rejeitar') ||
      title.includes('tornar privado') ||
      title.includes('retract')
    );
  });

const ContentBrowser: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const path = useMemo(() => {
    const splat = params['*'] || '';
    return toPlonePath(splat);
  }, [params]);

  const [parent, setParent] = useState<PloneContentItem | null>(null);
  const [items, setItems] = useState<PloneContentItem[]>([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [crumbs, setCrumbs] = useState<BreadcrumbItem[]>([]);
  const [types, setTypes] = useState<PloneTypeInfo[]>([]);
  const [workflow, setWorkflow] = useState<PloneWorkflowInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorType, setEditorType] = useState('Folder');
  const [editingItem, setEditingItem] = useState<PloneContentItem | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [sharingOpen, setSharingOpen] = useState(false);
  const [sharingPath, setSharingPath] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPath, setHistoryPath] = useState('');
  const [historyTitle, setHistoryTitle] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<PloneContentItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<PloneContentItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [moveTarget, setMoveTarget] = useState<PloneContentItem | null>(null);
  const [movePath, setMovePath] = useState('');
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [typeFilter, setTypeFilter] = useState<string>(
    () => searchParams.get('type') || 'all'
  );
  /** all | private | published | outros review_state */
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [creatorFilter, setCreatorFilter] = useState(
    () => searchParams.get('creator') || ''
  );
  const [modifiedFilter, setModifiedFilter] = useState(
    () => searchParams.get('modified') || 'any'
  );
  const [sortKey, setSortKey] = useState<SortKey>('position');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<ClipboardPayload | null>(() => readClipboard());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<PloneContentItem | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchLock = useRef(false);
  const metaLoadedForPath = useRef<string | null>(null);

  const listOptions = useMemo(
    () => ({
      portal_type: typeFilter === 'all' ? undefined : typeFilter,
      review_state: stateFilter === 'all' ? undefined : stateFilter,
      SearchableText: query.trim() || undefined,
      Creator: creatorFilter.trim() || undefined,
      modifiedAfter: modifiedAfterFromPreset(modifiedFilter),
    }),
    [typeFilter, stateFilter, query, creatorFilter, modifiedFilter]
  );

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
        const listing = await listFolderContents(path, {
          b_size: PAGE_SIZE,
          b_start: bStart,
          ...listOptions,
        });

        if (listing.parent && !isFolderishContent(listing.parent)) {
          const parentPath = parentPlonePath(path);
          toast.message('Este item não é uma pasta. Abrindo a pasta pai.');
          navigate(adminContentHref(parentPath), { replace: true });
          return;
        }

        setParent(listing.parent);
        setItemsTotal(listing.items_total);
        setItems((prev) => {
          if (!append) return listing.items;
          const seen = new Set(prev.map((i) => i['@id']));
          const extra = listing.items.filter((i) => !seen.has(i['@id']));
          return [...prev, ...extra];
        });

        if (!append || metaLoadedForPath.current !== path) {
          const [breadcrumbs, addable, wf] = await Promise.all([
            getBreadcrumbs(path),
            getAddableTypes(path),
            getWorkflow(path).catch(() => null),
          ]);
          setCrumbs(breadcrumbs);
          setTypes(addable);
          setWorkflow(wf);
          metaLoadedForPath.current = path;
        }
      } catch (err) {
        if (!append) {
          const message =
            err instanceof ApiError
              ? err.message
              : 'Não foi possível carregar o conteúdo.';
          setError(message);
          setParent(null);
          setItems([]);
          setItemsTotal(0);
        }
      } finally {
        fetchLock.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [path, navigate, listOptions]
  );

  const load = useCallback(async () => {
    setItems([]);
    setItemsTotal(0);
    await loadPage(0, false);
  }, [loadPage]);

  const reloadAndSyncTree = useCallback(async () => {
    invalidateAdminFolderTreeCache(path);
    await load();
  }, [load, path]);

  useEffect(() => {
    setSelectedId(null);
    setSelected(new Set());
    setPreviewItem(null);
    metaLoadedForPath.current = null;
    void load();
  }, [load]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setTypeFilter(searchParams.get('type') || 'all');
    setCreatorFilter(searchParams.get('creator') || '');
    setModifiedFilter(searchParams.get('modified') || 'any');
  }, [searchParams]);

  const hasMore = items.length < itemsTotal;

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || fetchLock.current) return;
    void loadPage(items.length, true);
  }, [hasMore, loading, loadingMore, loadPage, items.length]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || items.length === 0) return;

    let root: Element | null = null;
    let parentEl: HTMLElement | null = node.parentElement;
    while (parentEl) {
      const { overflowY } = getComputedStyle(parentEl);
      if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
        root = parentEl;
        break;
      }
      parentEl = parentEl.parentElement;
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

  const filteredItems = useMemo(() => {
    // Filtros tipo/visibilidade/busca vão no @search; aqui só ordena o lote carregado.
    // "position" = ordem do Plone (getObjPositionInParent), sem reordenar no cliente.
    if (sortKey === 'position') {
      return sortDir === 'asc' ? items : [...items].reverse();
    }
    return [...items].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'modified') {
        cmp = (a.modified || '').localeCompare(b.modified || '');
      } else if (sortKey === 'type') {
        cmp = getContentTypeLabel(a).localeCompare(getContentTypeLabel(b), 'pt-BR');
      } else if (sortKey === 'owner') {
        cmp = (a.Creator || '').localeCompare(b.Creator || '', 'pt-BR', {
          sensitivity: 'base',
        });
      } else {
        const af = isFolderishContent(a) ? 0 : 1;
        const bf = isFolderishContent(b) ? 0 : 1;
        if (af !== bf) {
          cmp = af - bf;
        } else {
          cmp = getContentDisplayName(a).localeCompare(
            getContentDisplayName(b),
            'pt-BR',
            { sensitivity: 'base' }
          );
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  const handleColumnSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'modified' ? 'desc' : 'asc');
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return (
      <span className="text-[10px] leading-none" aria-hidden>
        {sortDir === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const openCreate = (typeId: string) => {
    setEditorMode('create');
    setEditorType(typeId);
    setEditingItem(null);
    setEditorOpen(true);
  };

  useEffect(() => {
    const state = location.state as
      | {
          intent?: AdminCreateIntent;
          focusPath?: string;
          openAction?: 'preview' | 'edit' | 'share' | 'history';
        }
      | null;
    const intent = state?.intent;
    const focusPath = state?.focusPath;
    const openAction = state?.openAction;

    if (intent) {
      if (intent.kind === 'upload') {
        setUploadOpen(true);
      } else if (intent.kind === 'create') {
        openCreate(intent.type);
      }
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
      return;
    }

    if (!focusPath || loading) return;

    const target = items.find((item) => toPlonePath(item['@id']) === focusPath);
    if (target) {
      setSelectedId(target['@id']);
      setSelected(new Set([target['@id']]));
      const pathToFocus = focusPath;
      window.setTimeout(() => {
        const el = document.querySelector(
          `[data-plone-path="${CSS.escape(pathToFocus)}"]`
        );
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 50);

      if (openAction === 'edit') {
        setEditorMode('edit');
        setEditorType(target['@type']);
        setEditingItem(target);
        setEditorOpen(true);
      } else if (openAction === 'share') {
        setSharingPath(toPlonePath(target['@id']));
        setSharingOpen(true);
      } else if (openAction === 'history') {
        setHistoryPath(toPlonePath(target['@id']));
        setHistoryTitle(getContentDisplayName(target));
        setHistoryOpen(true);
      } else if (openAction === 'preview') {
        const type = resolveContentType(target);
        if (type === 'File' || type === 'Image') {
          setPreviewItem(target);
        } else if (type === 'Link') {
          const url =
            (typeof target.remoteUrl === 'string' && target.remoteUrl) ||
            target['@id'];
          if (url) window.open(url, '_blank', 'noopener,noreferrer');
        } else if (type === 'Document') {
          window.open(target['@id'], '_blank', 'noopener,noreferrer');
        }
      }
    }
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, loading, items]);

  const openEdit = (item: PloneContentItem) => {
    setEditorMode('edit');
    setEditorType(item['@type']);
    setEditingItem(item);
    setEditorOpen(true);
  };

  const openView = (item: PloneContentItem) => {
    const type = resolveContentType(item);
    if (type === 'Link') {
      const url =
        (typeof item.remoteUrl === 'string' && item.remoteUrl) || item['@id'];
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (type === 'Document') {
      // Página Plone: abre no site (sem preview binário).
      window.open(item['@id'], '_blank', 'noopener,noreferrer');
      return;
    }
    if (type === 'File' || type === 'Image') {
      setPreviewItem(item);
      return;
    }
    toast.message('Este tipo de conteúdo não tem visualização.');
  };

  const handleItemClick = (item: PloneContentItem, event?: React.MouseEvent) => {
    if (event?.metaKey || event?.ctrlKey) {
      toggleSelect(item['@id'], !selected.has(item['@id']));
      return;
    }
    setSelectedId(item['@id']);
    const itemPath = toPlonePath(item['@id']);
    if (isFolderishContent(item)) {
      navigate(adminContentHref(itemPath));
      return;
    }
    // Arquivo/página: só seleciona (editar pelo menu ou barra).
    setSelected(new Set([item['@id']]));
  };

  const handleItemDoubleClick = (item: PloneContentItem) => {
    if (isFolderishContent(item)) {
      navigate(adminContentHref(toPlonePath(item['@id'])));
      return;
    }
    if (canViewContent(item)) {
      openView(item);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContent(toPlonePath(deleteTarget['@id']));
      toast.success('Item excluído.');
      setDeleteTarget(null);
      await reloadAndSyncTree();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao excluir.');
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await renameContent(toPlonePath(renameTarget['@id']), renameValue.trim());
      toast.success('Item renomeado.');
      setRenameTarget(null);
      await reloadAndSyncTree();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao renomear.');
    }
  };

  const handleCopyHere = async (item: PloneContentItem) => {
    try {
      await copyContent(toPlonePath(item['@id']), path);
      toast.success('Cópia criada nesta pasta.');
      await reloadAndSyncTree();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao copiar.');
    }
  };

  const handleMove = async () => {
    if (!moveTarget) return;
    try {
      await moveContent(toPlonePath(moveTarget['@id']), movePath.trim());
      toast.success('Item movido.');
      setMoveTarget(null);
      await reloadAndSyncTree();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao mover.');
    }
  };

  const handleTransition = async (transitionId: string) => {
    try {
      await transitionWorkflow(path, transitionId);
      toast.success('Estado atualizado.');
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha no workflow.');
    }
  };

  const publishItem = async (item: PloneContentItem): Promise<boolean> => {
    const wf = await getWorkflow(toPlonePath(item['@id']));
    const publish = findPublishTransition(wf.transitions);
    const transitionId = getTransitionId(publish);
    if (!transitionId) return false;
    await transitionWorkflow(toPlonePath(item['@id']), transitionId);
    return true;
  };

  const retractItem = async (item: PloneContentItem): Promise<boolean> => {
    const wf = await getWorkflow(toPlonePath(item['@id']));
    const retract = findRetractTransition(wf.transitions);
    const transitionId = getTransitionId(retract);
    if (!transitionId) return false;
    await transitionWorkflow(toPlonePath(item['@id']), transitionId);
    return true;
  };

  const handleBulkPublish = async () => {
    const targets = selectedItems.filter(isUnpublished);
    if (!targets.length) {
      toast.message('Nenhum item não publicado na seleção.');
      return;
    }
    let ok = 0;
    let fail = 0;
    let unavailable = 0;
    for (const item of targets) {
      try {
        const done = await publishItem(item);
        if (done) ok += 1;
        else unavailable += 1;
      } catch {
        fail += 1;
      }
    }
    if (ok) toast.success(`${ok} item(ns) publicado(s).`);
    if (unavailable) {
      toast.message(
        `${unavailable} item(ns) sem transição de publicação disponível.`
      );
    }
    if (fail) toast.error(`${fail} item(ns) falharam ao publicar.`);
    setSelected(new Set());
    await load();
  };

  const handleBulkRetract = async () => {
    const targets = selectedItems.filter(isPublished);
    if (!targets.length) {
      toast.message('Nenhum item publicado na seleção.');
      return;
    }
    let ok = 0;
    let fail = 0;
    let unavailable = 0;
    for (const item of targets) {
      try {
        const done = await retractItem(item);
        if (done) ok += 1;
        else unavailable += 1;
      } catch {
        fail += 1;
      }
    }
    if (ok) toast.success(`${ok} item(ns) tornado(s) privado(s).`);
    if (unavailable) {
      toast.message(
        `${unavailable} item(ns) sem transição para privado disponível.`
      );
    }
    if (fail) toast.error(`${fail} item(ns) falharam ao tornar privado.`);
    setSelected(new Set());
    await load();
  };

  const createable = types.filter((t) => {
    const id = t.id || t['@id']?.split('/').pop() || '';
    return ['Folder', 'Document', 'File', 'Link', 'Collection', 'Image'].includes(id);
  });

  const canUpload = createable.some(
    (t) => (t.id || t['@id']?.split('/').pop()) === 'File'
  );

  const selectedItems = useMemo(
    () => filteredItems.filter((item) => selected.has(item['@id'])),
    [filteredItems, selected]
  );

  const allVisibleSelected =
    filteredItems.length > 0 && filteredItems.every((item) => selected.has(item['@id']));

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(filteredItems.map((i) => i['@id'])));
  };

  const putClipboard = (mode: 'cut' | 'copy') => {
    if (!selectedItems.length) return;
    const payload: ClipboardPayload = {
      mode,
      paths: selectedItems.map((i) => toPlonePath(i['@id'])),
      sourceFolder: path,
    };
    writeClipboard(payload);
    setClipboard(payload);
    setSelected(new Set());
    toast.success(
      mode === 'cut'
        ? `${payload.paths.length} item(ns) recortado(s). Vá à pasta destino e cole.`
        : `${payload.paths.length} item(ns) copiado(s). Vá à pasta destino e cole.`
    );
  };

  const putItemClipboard = (item: PloneContentItem, mode: 'cut' | 'copy') => {
    const payload: ClipboardPayload = {
      mode,
      paths: [toPlonePath(item['@id'])],
      sourceFolder: path,
    };
    writeClipboard(payload);
    setClipboard(payload);
    toast.success(
      mode === 'cut'
        ? 'Item recortado. Vá à pasta destino e cole.'
        : 'Item copiado. Vá à pasta destino e cole.'
    );
  };

  const subsetIdsForReorder = () =>
    items.map((i) => i.id).filter((id): id is string => Boolean(id));

  const reorderItems = async (
    targets: PloneContentItem[],
    delta: 'top' | 'bottom'
  ) => {
    const withId = targets.filter((i) => i.id);
    if (!withId.length) {
      toast.message('Não foi possível identificar o id dos itens selecionados.');
      return;
    }
    const subsetIds = subsetIdsForReorder();
    const ordered = [...withId].sort(
      (a, b) =>
        items.findIndex((i) => i['@id'] === a['@id']) -
        items.findIndex((i) => i['@id'] === b['@id'])
    );
    // Preserva ordem relativa: no topo processa do último ao primeiro;
    // no final, do primeiro ao último.
    const toProcess = delta === 'top' ? [...ordered].reverse() : ordered;
    let ok = 0;
    let fail = 0;
    for (const item of toProcess) {
      try {
        await reorderFolderItem(path, item.id!, delta, subsetIds);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setSortKey('position');
    setSortDir('asc');
    if (ok) {
      toast.success(
        delta === 'top'
          ? `${ok} item(ns) movido(s) para o topo.`
          : `${ok} item(ns) movido(s) para o final.`
      );
    }
    if (fail) {
      toast.error(`${fail} item(ns) falharam ao reordenar.`);
    }
    await load();
  };

  const handlePaste = async () => {
    const clip = clipboard || readClipboard();
    if (!clip?.paths.length) {
      toast.message('Nada para colar.');
      return;
    }
    let ok = 0;
    let fail = 0;
    for (const sourcePath of clip.paths) {
      try {
        if (clip.mode === 'cut') {
          await moveContent(sourcePath, path);
        } else {
          await copyContent(sourcePath, path);
        }
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    if (clip.mode === 'cut') {
      clearClipboard();
      setClipboard(null);
    }
    if (ok) toast.success(`${ok} item(ns) colado(s).`);
    if (fail) toast.error(`${fail} item(ns) falharam ao colar.`);
    if (clip.mode === 'cut') {
      invalidateAdminFolderTreeCache();
    } else {
      invalidateAdminFolderTreeCache(path);
    }
    await load();
  };

  const handleBulkDelete = async () => {
    let ok = 0;
    for (const item of selectedItems) {
      try {
        await deleteContent(toPlonePath(item['@id']));
        ok += 1;
      } catch {
        // continue
      }
    }
    setBulkDeleteOpen(false);
    setSelected(new Set());
    toast.success(`${ok} item(ns) excluído(s).`);
    await reloadAndSyncTree();
  };

  const primarySelected = selectedItems[0] || null;

  type MenuItemComp = typeof DropdownMenuItem | typeof ContextMenuItem;
  type MenuSepComp = typeof DropdownMenuSeparator | typeof ContextMenuSeparator;

  const itemMenuItems = (
    item: PloneContentItem,
    Item: MenuItemComp,
    Separator: MenuSepComp
  ) => (
    <>
      {canViewContent(item) && (
        <Item className={adminDriveMenuItemClass} onClick={() => openView(item)}>
          <Eye className={adminDriveMenuIconClass} />
          Visualizar
        </Item>
      )}
      <Item className={adminDriveMenuItemClass} onClick={() => openEdit(item)}>
        <Pencil className={adminDriveMenuIconClass} />
        Editar
      </Item>
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => {
          setSharingPath(toPlonePath(item['@id']));
          setSharingOpen(true);
        }}
      >
        <Share2 className={adminDriveMenuIconClass} />
        Compartilhar
      </Item>
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => {
          setHistoryPath(toPlonePath(item['@id']));
          setHistoryTitle(getContentDisplayName(item));
          setHistoryOpen(true);
        }}
      >
        <History className={adminDriveMenuIconClass} />
        Histórico
      </Item>
      <Separator className={adminDriveMenuSeparatorClass} />
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => putItemClipboard(item, 'cut')}
      >
        <Scissors className={adminDriveMenuIconClass} />
        Recortar
      </Item>
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => putItemClipboard(item, 'copy')}
      >
        <Copy className={adminDriveMenuIconClass} />
        Copiar
      </Item>
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => void reorderItems([item], 'top')}
      >
        <ArrowUpToLine className={adminDriveMenuIconClass} />
        Mover para o topo da pasta
      </Item>
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => void reorderItems([item], 'bottom')}
      >
        <ArrowDownToLine className={adminDriveMenuIconClass} />
        Mover para o final da pasta
      </Item>
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => toggleSelectAll(true)}
      >
        <CheckCheck className={adminDriveMenuIconClass} />
        Selecionar todos os itens
      </Item>
      <Separator className={adminDriveMenuSeparatorClass} />
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => {
          setRenameTarget(item);
          setRenameValue(item.id || '');
        }}
      >
        Renomear (id)
      </Item>
      <Item className={adminDriveMenuItemClass} onClick={() => handleCopyHere(item)}>
        <Copy className={adminDriveMenuIconClass} />
        Fazer uma cópia
      </Item>
      {canDownloadContent(item) && (
        <Item
          className={adminDriveMenuItemClass}
          onClick={() => {
            void (async () => {
              try {
                await downloadPloneFile(item);
              } catch (err) {
                toast.error(
                  err instanceof ApiError ? err.message : 'Falha ao baixar o arquivo.'
                );
              }
            })();
          }}
        >
          <Download className={adminDriveMenuIconClass} />
          Fazer download
        </Item>
      )}
      <Item
        className={adminDriveMenuItemClass}
        onClick={() => {
          setMoveTarget(item);
          setMovePath('');
        }}
      >
        Mover para…
      </Item>
      {isUnpublished(item) && (
        <Item
          className={adminDriveMenuItemClass}
          onClick={async () => {
            try {
              const done = await publishItem(item);
              if (done) {
                toast.success('Item publicado.');
                await load();
              } else {
                toast.message(
                  'Nenhuma transição de publicação disponível neste item.'
                );
              }
            } catch (err) {
              toast.error(
                err instanceof ApiError ? err.message : 'Falha ao publicar.'
              );
            }
          }}
        >
          <Workflow className={adminDriveMenuIconClass} />
          Publicar
        </Item>
      )}
      {isPublished(item) && (
        <Item
          className={adminDriveMenuItemClass}
          onClick={async () => {
            try {
              const done = await retractItem(item);
              if (done) {
                toast.success('Item tornado privado.');
                await load();
              } else {
                toast.message(
                  'Nenhuma transição para privado disponível neste item.'
                );
              }
            } catch (err) {
              toast.error(
                err instanceof ApiError
                  ? err.message
                  : 'Falha ao tornar privado.'
              );
            }
          }}
        >
          <EyeOff className={adminDriveMenuIconClass} />
          Tornar privado
        </Item>
      )}
      <Separator className={adminDriveMenuSeparatorClass} />
      <Item
        className={adminDriveMenuDangerItemClass}
        onClick={() => setDeleteTarget(item)}
      >
        <Trash2 className={adminDriveMenuIconClass} />
        Remover
      </Item>
    </>
  );

  const itemActions = (item: PloneContentItem) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full text-slate-500 opacity-70 transition-opacity hover:bg-slate-200/80 hover:opacity-100 focus-visible:opacity-100 data-[state=open]:bg-slate-200/80 data-[state=open]:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          title="Ações"
          aria-label="Ações"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={adminDriveMenuContentClass}
        onClick={(e) => e.stopPropagation()}
      >
        {itemMenuItems(item, DropdownMenuItem, DropdownMenuSeparator)}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  /** Clique direito no conteúdo; ⋮ fica fora do trigger para o menu abrir. */
  const wrapItemContextMenu = (
    item: PloneContentItem,
    main: React.ReactElement,
    shellClassName: string
  ) => (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) {
          setSelectedId(item['@id']);
          setSelected(new Set([item['@id']]));
        }
      }}
    >
      <div
        className={shellClassName}
        data-plone-path={toPlonePath(item['@id'])}
      >
        <ContextMenuTrigger asChild>{main}</ContextMenuTrigger>
        {itemActions(item)}
      </div>
      <ContextMenuContent className={adminDriveMenuContentClass}>
        {itemMenuItems(item, ContextMenuItem, ContextMenuSeparator)}
      </ContextMenuContent>
    </ContextMenu>
  );

  const typeOptions = useMemo(() => {
    const set = new Set(items.map((i) => i['@type']));
    return Array.from(set);
  }, [items]);

  const stateOptions = useMemo(() => {
    const set = new Set(
      items.map((i) => getReviewState(i)).filter(Boolean)
    );
    const preferred = ['private', 'published', 'pending', 'visible'];
    return [
      ...preferred.filter((s) => set.has(s)),
      ...Array.from(set).filter((s) => !preferred.includes(s)).sort(),
    ];
  }, [items]);

  const privateCount = useMemo(
    () => items.filter((i) => getReviewState(i) === 'private').length,
    [items]
  );

  const stateBadge = (item: PloneContentItem) => {
    const state = getReviewState(item);
    if (!state || state === 'published') return null;
    const label = REVIEW_STATE_LABELS[state] || state;
    return (
      <span
        title={label}
        className={cn(
          'shrink-0 text-[10px] font-medium leading-none tracking-wide',
          state === 'private' ? 'text-slate-400' : 'text-amber-600/90'
        )}
      >
        · {label}
      </span>
    );
  };

  const itemRowClass = (item: PloneContentItem, active: boolean) => {
    const privateItem = getReviewState(item) === 'private';
    const draft = isUnpublished(item) && !privateItem;
    return cn(
      'group grid cursor-pointer grid-cols-[28px_minmax(0,1fr)_40px] items-center gap-2 rounded-2xl px-2 py-2 transition-colors sm:grid-cols-[28px_minmax(0,1.4fr)_120px_140px_40px] lg:grid-cols-[28px_minmax(0,1.4fr)_140px_150px_100px_40px]',
      active
        ? privateItem
          ? 'bg-slate-200/80'
          : draft
            ? 'bg-slate-100'
            : 'bg-ufac-lightBlue/50'
        : privateItem
          ? 'bg-slate-100/90 hover:bg-slate-100'
          : draft
            ? 'bg-slate-50 hover:bg-slate-100/80'
            : 'hover:bg-slate-50'
    );
  };

  const itemCardClass = (item: PloneContentItem, active: boolean) => {
    const privateItem = getReviewState(item) === 'private';
    const draft = isUnpublished(item) && !privateItem;
    return cn(
      'group flex h-11 w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border py-1.5 pl-1.5 pr-1 transition',
      privateItem
        ? 'border-transparent bg-slate-100/90 hover:bg-slate-100'
        : draft
          ? 'border-transparent bg-slate-50 hover:bg-slate-100/80'
          : 'border-transparent bg-[#e9eef6]/80 hover:bg-[#e9eef6]',
      active &&
        (privateItem
          ? 'bg-slate-200/90'
          : draft
            ? 'bg-slate-100'
            : 'bg-ufac-lightBlue/70 ring-1 ring-ufac-blue/20')
    );
  };

  const formatShortDate = (value?: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const chipClass = (active: boolean) =>
    cn(
      'inline-flex h-8 items-center gap-1 rounded-full border px-3 text-sm font-medium leading-none transition-colors',
      active
        ? 'border-ufac-blue bg-ufac-lightBlue text-ufac-blue'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Título + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <Link
              to="/admin/conteudo"
              className="rounded-full px-1.5 py-0.5 hover:bg-slate-100 hover:text-ufac-blue"
            >
              Editais
            </Link>
            {crumbs.map((crumb, index) => {
              const crumbPath = toPlonePath(crumb['@id']);
              const isLast = index === crumbs.length - 1;
              return (
                <React.Fragment key={crumb['@id']}>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  {isLast ? (
                    <span className="font-medium text-slate-800">{crumb.title}</span>
                  ) : (
                    <Link
                      to={adminContentHref(crumbPath)}
                      className="rounded-full px-1.5 py-0.5 hover:bg-slate-100 hover:text-ufac-blue"
                    >
                      {crumb.title}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex max-w-full items-center gap-1 truncate text-2xl font-normal text-slate-900 hover:bg-slate-50 rounded-lg px-1 -ml-1"
              >
                <span className="truncate">{parent ? getContentDisplayName(parent) : 'Editais'}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl">
              <DropdownMenuItem
                onClick={() => {
                  setSharingPath(path);
                  setSharingOpen(true);
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </DropdownMenuItem>
              {parent && parent['@type'] !== 'Plone Site' && (
                <DropdownMenuItem onClick={() => openEdit(parent)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar pasta
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => load()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-full',
              viewMode === 'list' && 'bg-white text-ufac-blue shadow-sm'
            )}
            onClick={() => setViewMode('list')}
            title="Lista"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-full',
              viewMode === 'grid' && 'bg-white text-ufac-blue shadow-sm'
            )}
            onClick={() => setViewMode('grid')}
            title="Grade"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {previewItem ? (
        <AdminFilePreviewPanel
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      ) : (
        <>
      {/* Ações de seleção (quando há itens marcados) */}
      {selected.size > 0 && (
        <SelectionToolbar
          count={selected.size}
          canPaste={Boolean(clipboard?.paths.length)}
          canPublish={selectedItems.some(isUnpublished)}
          canRetract={selectedItems.some(isPublished)}
          clipboardMode={clipboard?.mode}
          sortKey={sortKey}
          singleSelected={selected.size === 1}
          canView={Boolean(primarySelected && canViewContent(primarySelected))}
          onClear={() => setSelected(new Set())}
          onCut={() => putClipboard('cut')}
          onCopy={() => putClipboard('copy')}
          onPaste={handlePaste}
          onDelete={() => setBulkDeleteOpen(true)}
          onPublish={handleBulkPublish}
          onRetract={handleBulkRetract}
          onShare={() => {
            if (!primarySelected) return;
            setSharingPath(toPlonePath(primarySelected['@id']));
            setSharingOpen(true);
          }}
          onView={() => {
            if (primarySelected) openView(primarySelected);
          }}
          onEdit={() => {
            if (primarySelected) openEdit(primarySelected);
          }}
          onSort={(key) => handleColumnSort(key)}
          onMoveToTop={() => void reorderItems(selectedItems, 'top')}
          onMoveToBottom={() => void reorderItems(selectedItems, 'bottom')}
          onSelectAllContained={() => toggleSelectAll(true)}
        />
      )}

      {/* Filtros de exibição — sempre visíveis */}
      <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={chipClass(typeFilter !== 'all')}>
                Tipo
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl">
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {typeOptions.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>
                  {TYPE_LABELS[t] || t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={chipClass(sortKey !== 'position')}>
                Ordenar
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl">
              <DropdownMenuItem onClick={() => handleColumnSort('position')}>
                Posição na pasta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleColumnSort('name')}>Nome</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleColumnSort('modified')}>
                Modificação
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleColumnSort('type')}>Tipo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleColumnSort('owner')}>
                Proprietário
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={chipClass(stateFilter !== 'all')}>
                Visibilidade
                {stateFilter !== 'all'
                  ? `: ${REVIEW_STATE_LABELS[stateFilter] || stateFilter}`
                  : privateCount > 0
                    ? ` (${privateCount})`
                    : ''}
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl">
              <DropdownMenuItem onClick={() => setStateFilter('all')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStateFilter('private')}>
                Só privados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStateFilter('published')}>
                Só publicados
              </DropdownMenuItem>
              {stateOptions
                .filter((s) => s !== 'private' && s !== 'published')
                .map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setStateFilter(s)}>
                    Só {REVIEW_STATE_LABELS[s] || s}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {canUpload && (
            <button
              type="button"
              className={chipClass(false)}
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="mr-1 inline h-3.5 w-3.5" />
              Enviar
            </button>
          )}

          {clipboard?.paths.length ? (
            <button type="button" className={chipClass(true)} onClick={handlePaste}>
              <ClipboardPaste className="mr-1 inline h-3.5 w-3.5" />
              Colar ({clipboard.paths.length})
            </button>
          ) : null}

          {workflow?.transitions && workflow.transitions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={chipClass(false)}>
                  Estado
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                {workflow.transitions.map((t) => {
                  const tid = getTransitionId(t);
                  return (
                    <DropdownMenuItem
                      key={tid || t['@id'] || t.title}
                      onClick={() => tid && handleTransition(tid)}
                    >
                      {t.title || tid}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <span className="ml-auto text-xs text-slate-500">
            {loading && items.length === 0
              ? '…'
              : itemsTotal > 0
                ? `${filteredItems.length.toLocaleString('pt-BR')} de ${itemsTotal.toLocaleString('pt-BR')}`
                : `${filteredItems.length} ${
                    filteredItems.length === 1 ? 'item' : 'itens'
                  }`}
            {stateFilter === 'all' && privateCount > 0
              ? ` · ${privateCount} privado${privateCount === 1 ? '' : 's'}`
              : ''}
          </span>
        </div>

      {loading && items.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
          <p className="font-medium">Erro ao carregar</p>
          <p className="mt-1 text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => load()}>
            Tentar de novo
          </Button>
        </div>
      ) : filteredItems.length === 0 && !loadingMore ? (
        <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
            <Folder className="h-8 w-8 fill-amber-400/80 text-amber-500" />
          </div>
          <h2 className="mt-5 text-xl font-normal text-slate-900">
            {query || typeFilter !== 'all' || stateFilter !== 'all'
              ? 'Nenhum resultado'
              : 'Pasta vazia'}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {stateFilter !== 'all'
              ? 'Tente outro filtro de visibilidade ou limpe o filtro “Visibilidade”.'
              : 'Use o botão Novo na barra lateral para criar pastas ou enviar arquivos.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="w-full space-y-2">
          <button
            type="button"
            onClick={() => handleColumnSort('name')}
            className={cn(
              'flex h-8 items-center gap-1 self-start px-1 text-xs font-medium hover:text-ufac-blue',
              sortKey === 'name' ? 'text-ufac-blue' : 'text-slate-500'
            )}
          >
            Nome
            {sortIndicator('name')}
          </button>
          <div className="grid w-full grid-cols-1 gap-2 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {filteredItems.map((item) => {
              const isChecked = selected.has(item['@id']);
              const active = isChecked || selectedId === item['@id'];
              return (
                <React.Fragment key={item['@id']}>
                  {wrapItemContextMenu(
                    item,
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleItemClick(item, e)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleItemClick(item);
                        }
                      }}
                      className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-5 shrink-0 items-center justify-center self-center transition-opacity',
                          active
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(v) =>
                            toggleSelect(item['@id'], v === true)
                          }
                          aria-label={`Selecionar ${getContentDisplayName(item)}`}
                        />
                      </div>
                      <span className="flex h-8 shrink-0 items-center self-center">
                        <AdminDriveIcon item={item} compact />
                      </span>
                      <div className="flex min-h-8 min-w-0 flex-1 items-center gap-1.5 self-center">
                        <p className="truncate text-left text-sm font-medium leading-none text-slate-900">
                          {getContentDisplayName(item)}
                        </p>
                        {stateBadge(item)}
                      </div>
                    </div>,
                    itemCardClass(item, active)
                  )}
                </React.Fragment>
              );
            })}
          </div>
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
              <p className="text-xs text-slate-400">
                Fim da lista · {itemsTotal.toLocaleString('pt-BR')} itens
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="min-w-0">
          <div className="grid grid-cols-[28px_minmax(0,1fr)_40px] gap-2 border-b border-slate-100 px-2 pb-2 text-xs font-medium text-slate-500 sm:grid-cols-[28px_minmax(0,1.4fr)_120px_140px_40px] lg:grid-cols-[28px_minmax(0,1.4fr)_140px_150px_100px_40px]">
            <div className="flex items-center">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={(v) => toggleSelectAll(v === true)}
                aria-label="Selecionar todos"
              />
            </div>
            <button
              type="button"
              onClick={() => handleColumnSort('name')}
              className={cn(
                'flex items-center gap-1 text-left hover:text-ufac-blue',
                sortKey === 'name' ? 'text-ufac-blue' : 'text-slate-500'
              )}
            >
              Nome
              {sortIndicator('name')}
            </button>
            <button
              type="button"
              onClick={() => handleColumnSort('owner')}
              className={cn(
                'hidden items-center gap-1 text-left hover:text-ufac-blue sm:flex',
                sortKey === 'owner' ? 'text-ufac-blue' : 'text-slate-500'
              )}
            >
              Proprietário
              {sortIndicator('owner')}
            </button>
            <button
              type="button"
              onClick={() => handleColumnSort('modified')}
              className={cn(
                'hidden items-center gap-1 text-left hover:text-ufac-blue sm:flex',
                sortKey === 'modified' ? 'text-ufac-blue' : 'text-slate-500'
              )}
            >
              Data da modificação
              {sortIndicator('modified')}
            </button>
            <button
              type="button"
              onClick={() => handleColumnSort('type')}
              className={cn(
                'hidden items-center gap-1 text-left hover:text-ufac-blue lg:flex',
                sortKey === 'type' ? 'text-ufac-blue' : 'text-slate-500'
              )}
            >
              Tipo
              {sortIndicator('type')}
            </button>
            <div />
          </div>
          <ul>
            {filteredItems.map((item) => {
              const isChecked = selected.has(item['@id']);
              const active = selectedId === item['@id'] || isChecked;
              return (
                <li key={item['@id']}>
                  {wrapItemContextMenu(
                    item,
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleItemClick(item, e)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleItemClick(item);
                        }
                      }}
                      className="contents"
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(v) =>
                            toggleSelect(item['@id'], v === true)
                          }
                          aria-label={`Selecionar ${getContentDisplayName(item)}`}
                        />
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        <AdminDriveIcon item={item} />
                        <span className="truncate text-[15px] text-slate-900">
                          {getContentDisplayName(item)}
                        </span>
                        {stateBadge(item)}
                      </div>
                      <div className="hidden truncate text-sm text-slate-600 sm:block">
                        {item.Creator || '—'}
                      </div>
                      <div className="hidden truncate text-sm text-slate-600 sm:block">
                        {formatShortDate(item.modified)}
                      </div>
                      <div className="hidden truncate text-sm text-slate-600 lg:block">
                        {getContentTypeLabel(item)}
                      </div>
                    </div>,
                    itemRowClass(item, active)
                  )}
                </li>
              );
            })}
          </ul>
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
              <p className="text-xs text-slate-400">
                Fim da lista · {itemsTotal.toLocaleString('pt-BR')} itens
              </p>
            )}
          </div>
        </div>
      )}
        </>
      )}

      <ContentEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editorMode}
        type={editorType}
        parentPath={path}
        item={editingItem}
        onSaved={async () => {
          setEditorOpen(false);
          await reloadAndSyncTree();
        }}
      />

      <UploadFileDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        parentPath={path}
        onUploaded={async () => {
          setUploadOpen(false);
          await reloadAndSyncTree();
        }}
      />

      <SharingDialog
        open={sharingOpen}
        onOpenChange={setSharingOpen}
        path={sharingPath}
      />

      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        path={historyPath}
        title={historyTitle}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove permanentemente “{deleteTarget ? getContentDisplayName(deleteTarget) : ''}” no Ufac. Esta ação
              não pode ser desfeita facilmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {selected.size} item{selected.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os itens selecionados serão removidos permanentemente no Ufac.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBulkDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renomear (nome curto / id)</AlertDialogTitle>
            <AlertDialogDescription>
              Altera o segmento da URL do item. Use apenas letras, números e hífens.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rename-id">Novo id</Label>
            <Input
              id="rename-id"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>Salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(moveTarget)}
        onOpenChange={(open) => !open && setMoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover item</AlertDialogTitle>
            <AlertDialogDescription>
              Informe o caminho da pasta de destino no Ufac (ex.: prograd ou
              prograd/2026). Deixe em branco para mover para a raiz do site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="move-path">Pasta de destino</Label>
            <Input
              id="move-path"
              value={movePath}
              onChange={(e) => setMovePath(e.target.value)}
              placeholder="prograd"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMove}>Mover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContentBrowser;
