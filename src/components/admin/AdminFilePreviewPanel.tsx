import { Button } from '@/components/ui/button';
import PdfViewer from '@/components/pdf/PdfViewer';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/services/apiClient';
import { ensureAuthCookies, getAccessToken } from '@/services/authService';
import {
  getContentDisplayName,
  toPlonePath,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { ArrowLeft, Download, ExternalLink, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type AdminFilePreviewPanelProps = {
  item: PloneContentItem;
  onClose: () => void;
  className?: string;
};

const isPdfMime = (mime: string, name: string) =>
  mime.includes('pdf') || name.toLowerCase().endsWith('.pdf');

const isImageMime = (mime: string, name: string) =>
  mime.startsWith('image/') ||
  /\.(png|jpe?g|gif|webp|svg)$/i.test(name);

/**
 * Preview embutido no container de arquivos (estilo Drive), com download autenticado.
 */
const AdminFilePreviewPanel: React.FC<AdminFilePreviewPanelProps> = ({
  item,
  onClose,
  className,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mime, setMime] = useState('');

  const title = getContentDisplayName(item);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const load = async () => {
      setLoading(true);
      setError(null);
      setBlobUrl(null);
      setMime('');

      const path = toPlonePath(item['@id']);
      if (!path) {
        setError('Caminho do arquivo inválido.');
        setLoading(false);
        return;
      }

      try {
        let res = await apiFetch(`/${path}/@download`, {
          headers: { Accept: '*/*' },
        });

        if (!res.ok) {
          ensureAuthCookies();
          const token = getAccessToken();
          const headers = new Headers({ Accept: '*/*' });
          if (token) headers.set('Authorization', `Bearer ${token}`);
          res = await fetch(`/__plone__/${path}/@@download/file`, {
            credentials: 'same-origin',
            headers,
          });
        }

        if (!res.ok) {
          throw new Error(`Falha ao baixar (${res.status})`);
        }

        const blob = await res.blob();
        if (!blob.size) throw new Error('Arquivo vazio.');

        const type =
          blob.type && blob.type !== 'application/octet-stream'
            ? blob.type
            : title.toLowerCase().endsWith('.pdf')
              ? 'application/pdf'
              : blob.type || 'application/octet-stream';

        const typed = type === blob.type ? blob : new Blob([blob], { type });
        objectUrl = URL.createObjectURL(typed);

        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setMime(type);
        setBlobUrl(objectUrl);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar o arquivo.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item, title]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const showPdf = Boolean(blobUrl && isPdfMime(mime, title));
  const showImage = Boolean(blobUrl && isImageMime(mime, title));

  return (
    <div
      className={cn(
        'flex min-h-[min(70vh,42rem)] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white',
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-2 py-2 sm:gap-3 sm:px-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-full px-2 text-slate-700 sm:px-3"
          onClick={onClose}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{title}</p>
          <p className="truncate text-xs text-slate-500">Visualização</p>
        </div>
        {blobUrl && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-full"
              asChild
            >
              <a href={blobUrl} download={title} title="Baixar">
                <Download className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Baixar</span>
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-full"
              asChild
            >
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir em nova aba"
              >
                <ExternalLink className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Nova aba</span>
              </a>
            </Button>
          </div>
        )}
      </header>

      <div className="relative min-h-0 flex-1 bg-slate-50">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
            <Loader2 className="h-8 w-8 animate-spin text-ufac-blue" />
            <p className="text-sm">Carregando…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="max-w-md text-sm text-red-600">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={onClose}
            >
              Voltar à pasta
            </Button>
          </div>
        )}

        {!loading && !error && showPdf && blobUrl && (
          <div className="h-full min-h-0 w-full">
            <PdfViewer
              fileUrl={blobUrl}
              fileName={title}
              toolbarVariant="tools"
            />
          </div>
        )}

        {!loading && !error && showImage && blobUrl && (
          <div className="flex h-full items-center justify-center overflow-auto p-6">
            <img
              src={blobUrl}
              alt={title}
              className="max-h-full max-w-full object-contain shadow-md"
            />
          </div>
        )}

        {!loading && !error && blobUrl && !showPdf && !showImage && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-md text-sm text-slate-600">
              Este tipo de arquivo não tem pré-visualização no navegador. Baixe
              ou abra em nova aba.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild className="rounded-full">
                <a href={blobUrl} download={title}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Baixar
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <a href={blobUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Abrir
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFilePreviewPanel;
