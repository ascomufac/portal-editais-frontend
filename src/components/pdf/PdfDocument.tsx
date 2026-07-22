import { Loader2 } from 'lucide-react';
import React, { useMemo, useRef } from 'react';
import { Document } from 'react-pdf';

interface PdfDocumentProps {
  pdfUrl: string;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
  pdfOptions: Record<string, unknown>;
  children: React.ReactNode;
}

/**
 * Documento PDF via react-pdf (espera blob: ou URL same-origin)
 */
const PdfDocument: React.FC<PdfDocumentProps> = ({
  pdfUrl,
  onLoadSuccess,
  onLoadError,
  pdfOptions,
  children,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);

  const memoizedOptions = useMemo(
    () => ({
      ...pdfOptions,
      withCredentials: false,
    }),
    [pdfOptions]
  );

  return (
    <Document
      file={pdfUrl}
      onLoadSuccess={onLoadSuccess}
      onLoadError={(error) => {
        console.error('Erro ao carregar PDF:', error);
        onLoadError(error);
      }}
      className="flex w-full flex-col items-center bg-ufac-lightBlue pb-4"
      loading={
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-ufac-blue mb-2" />
          <p className="text-gray-500">Carregando documento...</p>
        </div>
      }
      options={memoizedOptions}
      inputRef={documentRef}
      externalLinkTarget="_blank"
    >
      {children}
    </Document>
  );
};

export default PdfDocument;
