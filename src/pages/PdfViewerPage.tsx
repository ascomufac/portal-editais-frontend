import React, { useEffect } from 'react';
import PdfViewer from '@/components/pdf/PdfViewer';
import MainLayout from '@/layouts/MainLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn, getSidebarCollapsedState } from '@/lib/utils';
import { useParams } from 'react-router-dom';

/**
 * Página de visualização de PDF
 */
const PdfViewerPage: React.FC = () => {
  const { pdfUrl } = useParams<{ pdfUrl: string }>();
  const isMobile = useIsMobile();
  const isSidebarCollapsed = getSidebarCollapsedState();
  const decodedUrl = pdfUrl ? decodeURIComponent(pdfUrl) : '';

  // Impede o body de rolar — o scroll deve ficar só no container do PDF
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <MainLayout
      pageTitle="Visualizador de PDF"
      className="flex h-full min-h-0 flex-col overflow-hidden p-0"
    >
      <div
        className={cn(
          'relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden',
          !isMobile &&
            (isSidebarCollapsed
              ? 'max-w-[calc(100vw-4rem)]'
              : 'max-w-[calc(100vw-20rem)]')
        )}
      >
        {decodedUrl ? (
          <PdfViewer fileUrl={decodedUrl} />
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">URL do PDF não encontrada.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PdfViewerPage;
