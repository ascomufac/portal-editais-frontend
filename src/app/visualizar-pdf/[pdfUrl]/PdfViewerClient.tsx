'use client';

import dynamic from 'next/dynamic';

const PdfViewerPage = dynamic(() => import('@/views/PdfViewerPage'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
      Carregando visualizador…
    </div>
  ),
});

export default function PdfViewerClient() {
  return <PdfViewerPage />;
}
