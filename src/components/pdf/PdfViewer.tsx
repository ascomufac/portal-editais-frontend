import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { PdfViewerProvider } from './context/PdfViewerContext';
import PdfViewerLayout from './layout/PdfViewerLayout';
import PdfContent from './PdfContent';
import PdfLoadingError from './PdfLoadingError';
import { resolvePdfSource, type ResolvedPdfSource } from './utils/pdfUtils';

// Worker na mesma versão do pdfjs embutido no react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
  fileName?: string;
  /** tools: chrome mínimo (sem voltar/nome/baixar duplicados). */
  toolbarVariant?: 'full' | 'tools';
}

/**
 * Visualizador de PDF com resolução robusta para Plone (proxy + blob URL)
 */
const PdfViewer: React.FC<PdfViewerProps> = ({
  fileUrl,
  fileName,
  toolbarVariant = 'full',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<ResolvedPdfSource | null>(null);

  useEffect(() => {
    let cancelled = false;
    let revokeFn: (() => void) | undefined;

    const load = async () => {
      setLoading(true);
      setError(false);
      setSource(null);

      try {
        const resolved = await resolvePdfSource(fileUrl);
        if (cancelled) {
          resolved.revoke?.();
          return;
        }
        revokeFn = resolved.revoke;
        setSource(resolved);
      } catch (err) {
        console.error('Erro ao resolver PDF:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      revokeFn?.();
    };
  }, [fileUrl]);

  if (loading || error || !source) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <PdfLoadingError
          loading={loading}
          error={error}
          fileUrl={source?.downloadUrl || fileUrl}
        />
      </div>
    );
  }

  return (
    <PdfViewerProvider fileUrl={source.viewerUrl} downloadUrl={source.downloadUrl}>
      <PdfViewerLayout fileName={fileName || source.fileName} toolbarVariant={toolbarVariant}>
        <PdfContent />
      </PdfViewerLayout>
    </PdfViewerProvider>
  );
};

export default PdfViewer;
