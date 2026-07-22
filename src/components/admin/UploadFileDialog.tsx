import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ApiError, uploadFile } from '@/services/ploneContentService';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type UploadFileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentPath: string;
  onUploaded: () => void | Promise<void>;
};

type QueueStatus = 'ready' | 'uploading' | 'done' | 'error';

type QueueItem = {
  id: string;
  file: File;
  title: string;
  status: QueueStatus;
  progress: number;
  error?: string;
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB (base64 + Plone)
const ACCEPT =
  '.pdf,.doc,.docx,.odt,.xls,.xlsx,.zip,.png,.jpg,.jpeg,application/pdf';

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const titleFromFilename = (name: string) =>
  name.replace(/\.[^.]+$/, '') || name;

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
  open,
  onOpenChange,
  parentPath,
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<QueueItem[]>([]);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const reset = () => {
    setItems([]);
    setDragOver(false);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const addFiles = (list: FileList | File[]) => {
    const next: QueueItem[] = [];
    const rejected: string[] = [];

    Array.from(list).forEach((file) => {
      if (file.size > MAX_BYTES) {
        rejected.push(`${file.name} (máx. ${formatSize(MAX_BYTES)})`);
        return;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        title: titleFromFilename(file.name),
        status: 'ready',
        progress: 0,
      });
    });

    if (rejected.length) {
      toast.error(`Arquivo(s) acima do limite: ${rejected.join(', ')}`);
    }
    if (next.length) {
      setItems((prev) => [...prev, ...next]);
    }
  };

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const pendingCount = useMemo(
    () => items.filter((i) => i.status === 'ready' || i.status === 'error').length,
    [items]
  );
  const doneCount = useMemo(
    () => items.filter((i) => i.status === 'done').length,
    [items]
  );
  const overallProgress = useMemo(() => {
    if (!items.length) return 0;
    const sum = items.reduce((acc, item) => {
      if (item.status === 'done') return acc + 100;
      if (item.status === 'error') return acc;
      return acc + item.progress;
    }, 0);
    return Math.round(sum / items.length);
  }, [items]);

  const runUpload = async (onlyFailed = false) => {
    const queue = items.filter((item) =>
      onlyFailed ? item.status === 'error' : item.status === 'ready' || item.status === 'error'
    );
    if (!queue.length) {
      toast.error('Adicione ao menos um arquivo.');
      return;
    }

    setUploading(true);
    let ok = 0;
    let fail = 0;

    for (const item of queue) {
      updateItem(item.id, { status: 'uploading', progress: 2, error: undefined });
      const latest = itemsRef.current.find((p) => p.id === item.id);
      const title = (latest?.title || item.title).trim() || undefined;

      try {
        await uploadFile(parentPath, item.file, title, (percent) => {
          updateItem(item.id, { progress: percent, status: 'uploading' });
        });
        updateItem(item.id, { status: 'done', progress: 100 });
        ok += 1;
      } catch (err) {
        fail += 1;
        updateItem(item.id, {
          status: 'error',
          progress: 0,
          error: err instanceof ApiError ? err.message : 'Falha no upload.',
        });
      }
    }

    setUploading(false);

    if (ok && !fail) {
      toast.success(
        ok === 1 ? 'Arquivo enviado com sucesso.' : `${ok} arquivos enviados com sucesso.`
      );
      await onUploaded();
    } else if (ok && fail) {
      toast.message(`${ok} enviado(s), ${fail} com erro.`);
      await onUploaded();
    } else {
      toast.error('Nenhum arquivo foi enviado.');
    }
  };

  const canClose = !uploading;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && uploading) return;
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1.5 border-b border-slate-100 px-6 pb-4 pt-6 text-left">
          <DialogTitle>Enviar arquivos</DialogTitle>
          <DialogDescription>
            Arraste PDFs e documentos do edital. Você pode enviar vários de uma vez.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div
            className={cn(
              'relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition-colors',
              dragOver
                ? 'border-ufac-blue bg-ufac-lightBlue/50'
                : 'border-slate-200 bg-slate-50/80 hover:border-ufac-blue/40 hover:bg-ufac-lightBlue/20'
            )}
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (uploading) return;
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
              <FileUp className="h-6 w-6 text-ufac-blue" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-800">
              Arraste arquivos aqui
            </p>
            <p className="mt-1 text-center text-xs text-slate-500">
              ou clique para escolher · PDF, Word, Excel, ZIP · até{' '}
              {formatSize(MAX_BYTES)} cada
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 rounded-full"
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Selecionar arquivos
            </Button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              accept={ACCEPT}
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {items.length} arquivo{items.length === 1 ? '' : 's'}
                  {doneCount > 0 ? ` · ${doneCount} ok` : ''}
                </span>
                {uploading && (
                  <span className="font-medium text-ufac-blue">
                    Enviando… {overallProgress}%
                  </span>
                )}
              </div>

              {(uploading || doneCount > 0) && (
                <Progress
                  value={overallProgress}
                  className="h-1.5 bg-slate-100 [&>div]:bg-ufac-blue"
                />
              )}

              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      'rounded-xl border bg-white p-3 shadow-sm',
                      item.status === 'error'
                        ? 'border-red-200'
                        : item.status === 'done'
                          ? 'border-emerald-200'
                          : 'border-slate-200'
                    )}
                  >
                    <div className="flex gap-3">
                      <span
                        className={cn(
                          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                          item.status === 'done'
                            ? 'bg-emerald-50 text-emerald-600'
                            : item.status === 'error'
                              ? 'bg-red-50 text-red-500'
                              : 'bg-red-50 text-red-500'
                        )}
                      >
                        {item.status === 'done' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : item.status === 'error' ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : item.status === 'uploading' ? (
                          <Loader2 className="h-5 w-5 animate-spin text-ufac-blue" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatSize(item.file.size)}
                              {item.file.type ? ` · ${item.file.type}` : ''}
                            </p>
                          </div>
                          {item.status !== 'uploading' && item.status !== 'done' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:text-red-600"
                              onClick={() => removeItem(item.id)}
                              disabled={uploading}
                              aria-label="Remover da fila"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {item.status === 'done' && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                          )}
                        </div>

                        {item.status !== 'done' && (
                          <Input
                            value={item.title}
                            disabled={uploading && item.status === 'uploading'}
                            onChange={(e) =>
                              updateItem(item.id, { title: e.target.value })
                            }
                            placeholder="Título no Ufac"
                            className="h-9 rounded-lg text-sm"
                          />
                        )}

                        {item.status === 'uploading' && (
                          <div className="space-y-1">
                            <Progress
                              value={item.progress}
                              className="h-1.5 bg-slate-100 [&>div]:bg-ufac-blue"
                            />
                            <p className="text-[11px] text-slate-500">
                              {item.progress < 55
                                ? 'Preparando arquivo…'
                                : 'Enviando para o Ufac…'}{' '}
                              {item.progress}%
                            </p>
                          </div>
                        )}

                        {item.status === 'error' && item.error && (
                          <p className="text-xs text-red-600">{item.error}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-slate-100 px-6 py-4 sm:justify-between">
          <div className="flex gap-2">
            {items.some((i) => i.status === 'error') && !uploading && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => runUpload(true)}
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Tentar falhas
              </Button>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => canClose && onOpenChange(false)}
              disabled={!canClose}
            >
              {doneCount && !pendingCount ? 'Fechar' : 'Cancelar'}
            </Button>
            <Button
              className="rounded-full bg-ufac-blue"
              onClick={() => runUpload(false)}
              disabled={uploading || pendingCount === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  Enviar
                  {pendingCount > 0 ? ` (${pendingCount})` : ''}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileDialog;
