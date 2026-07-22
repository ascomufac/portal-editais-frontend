import React from 'react';
import PdfViewer from '@/components/pdf/PdfViewer';
import MainLayout from '@/layouts/MainLayout';
import { cn, getSidebarCollapsedState } from '@/lib/utils';
import { useParams } from 'react-router-dom';

/**
 * Página de visualização de PDF
 */
const PdfViewerPage: React.FC = () => {
  const { pdfUrl } = useParams<{ pdfUrl: string }>();
  const isSidebarCollapsed = getSidebarCollapsedState();
  const decodedUrl = pdfUrl ? decodeURIComponent(pdfUrl) : '';

  return (
    <MainLayout pageTitle="Visualizador de PDF" className="p-0 overflow-hidden">
      <div
        className={cn(
          'h-[calc(100vh-4rem)] relative z-30 w-full',
          isSidebarCollapsed ? 'max-w-[calc(100vw-64px)]' : 'max-w-[calc(100vw-320px)]'
        )}
      >
        {decodedUrl ? (
          <PdfViewer fileUrl={decodedUrl} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">URL do PDF não encontrada.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PdfViewerPage;
