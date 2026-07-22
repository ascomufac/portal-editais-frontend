import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ApiError,
  getContentHistory,
  getWorkflow,
  type PloneHistoryEntry,
} from '@/services/ploneContentService';
import { History, Loader2, RefreshCw, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type HistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
  title?: string;
};

const trim = (value?: string | null) =>
  typeof value === 'string' ? value.trim() : '';

/** Extrai login do @id Plone (`.../@users/cap` → `cap`). */
const idFromAtId = (atId?: string) => {
  const raw = trim(atId);
  if (!raw) return '';
  try {
    const segment = raw.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(segment);
  } catch {
    return raw.split('/').filter(Boolean).pop() || '';
  }
};

/**
 * Resolve o autor da entrada de histórico (vários formatos do Plone).
 */
export const actorLabel = (entry: PloneHistoryEntry | Record<string, unknown>): string => {
  const e = entry as PloneHistoryEntry & {
    userid?: string;
    user?: string | { fullname?: string; username?: string; id?: string; '@id'?: string };
    creator?: string;
  };

  const actor = e.actor;
  if (typeof actor === 'string' && trim(actor)) return trim(actor);
  if (actor && typeof actor === 'object') {
    const a = actor as {
      fullname?: string;
      username?: string;
      id?: string;
      title?: string;
      '@id'?: string;
    };
    const fromObj =
      trim(a.fullname) ||
      trim(a.title) ||
      trim(a.username) ||
      trim(a.id) ||
      idFromAtId(a['@id']);
    if (fromObj) return fromObj;
  }

  if (trim(e.userid)) return trim(e.userid);
  if (trim(e.creator)) return trim(e.creator);
  if (typeof e.user === 'string' && trim(e.user)) return trim(e.user);
  if (e.user && typeof e.user === 'object') {
    const u = e.user;
    const fromUser =
      trim(u.fullname) || trim(u.username) || trim(u.id) || idFromAtId(u['@id']);
    if (fromUser) return fromUser;
  }

  return '';
};

const actionLabel = (entry: PloneHistoryEntry): string => {
  if (entry.transition_title) return entry.transition_title;
  if (entry.action === 'Edited' || entry.type === 'versioning') return 'Editado';
  if (entry.action === 'Create' || entry.type == null) return 'Criado';
  if (entry.action) return String(entry.action);
  return entry.type || 'Alteração';
};

const formatWhen = (value?: string) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mergeWorkflowActors = (
  entries: PloneHistoryEntry[],
  workflowHistory: Array<{
    action?: string | null;
    actor?: string;
    time?: string;
    title?: string;
  }>
): PloneHistoryEntry[] => {
  if (!workflowHistory.length) return entries;
  return entries.map((entry) => {
    if (actorLabel(entry)) return entry;
    const match = workflowHistory.find((w) => {
      if (!w.time || !entry.time) return false;
      const sameTime =
        Math.abs(new Date(w.time).getTime() - new Date(entry.time).getTime()) < 2000;
      if (!sameTime) return false;
      if (entry.transition_title && w.title) {
        return (
          entry.transition_title.toLowerCase() === w.title.toLowerCase() ||
          entry.action === w.action
        );
      }
      return true;
    });
    if (match?.actor) {
      return { ...entry, actor: match.actor };
    }
    return entry;
  });
};

/**
 * Auditoria de um item via GET @history (somente leitura).
 */
const HistoryDialog: React.FC<HistoryDialogProps> = ({
  open,
  onOpenChange,
  path,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<PloneHistoryEntry[]>([]);

  const load = async () => {
    if (!path) return;
    setLoading(true);
    try {
      const [list, workflow] = await Promise.all([
        getContentHistory(path),
        getWorkflow(path).catch(() => null),
      ]);
      const withActors = mergeWorkflowActors(list, workflow?.history || []);
      setEntries(withActors);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Falha ao carregar histórico.'
      );
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, path]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-ufac-blue" />
            Histórico
          </DialogTitle>
          <DialogDescription>
            {title
              ? `Auditoria de “${title}”.`
              : 'Criação, edições e mudanças de estado.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => load()}
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando…
            </div>
          ) : entries.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Nenhum evento de histórico disponível.
            </p>
          ) : (
            <ol className="relative space-y-0 border-l border-slate-200 pl-4">
              {entries.map((entry, index) => {
                const author = actorLabel(entry);
                return (
                  <li
                    key={`${entry.time}-${entry.version ?? index}-${index}`}
                    className="relative pb-5 last:pb-0"
                  >
                    <span className="absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ufac-blue" />
                    <p className="text-sm font-medium text-slate-900">
                      {actionLabel(entry)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-700">
                      <User className="h-3.5 w-3.5 shrink-0 text-ufac-blue" aria-hidden />
                      <span className="font-medium">
                        {author ? (
                          <>
                            <span className="sr-only">Autor: </span>
                            {author}
                          </>
                        ) : (
                          <span className="font-normal text-slate-400">Autor desconhecido</span>
                        )}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatWhen(entry.time)}</p>
                    {entry.comments ? (
                      <p className="mt-1 text-xs text-slate-600">{entry.comments}</p>
                    ) : null}
                    {entry.type ? (
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                        {entry.type === 'workflow'
                          ? 'Workflow'
                          : entry.type === 'versioning'
                            ? 'Versão'
                            : entry.type}
                        {entry.version != null && entry.version !== ''
                          ? ` · v${entry.version}`
                          : ''}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
