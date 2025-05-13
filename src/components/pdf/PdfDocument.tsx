import { Loader2 } from 'lucide-react';
import React, { useMemo, useRef } from 'react';
import { Document } from 'react-pdf';
import { isPloneUrl } from './utils/pdfUtils';

/**
 * Interface para as propriedades do componente PdfDocument
 * @interface PdfDocumentProps
 * @property {string} pdfUrl - URL do documento PDF a ser exibido
 * @property {function} onLoadSuccess - Função chamada quando o documento é carregado com sucesso
 * @property {function} onLoadError - Função chamada quando ocorre um erro ao carregar o documento
 * @property {any} pdfOptions - Opções de configuração para o PDF.js
 * @property {React.ReactNode} children - Elementos filhos a serem renderizados dentro do componente
 */
interface PdfDocumentProps {
  pdfUrl: string;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
  pdfOptions: any;
  children: React.ReactNode;
}

/**
 * Componente para exibir um documento PDF
 * @param {PdfDocumentProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 */
const PdfDocument: React.FC<PdfDocumentProps> = ({
  pdfUrl,
  onLoadSuccess,
  onLoadError,
  pdfOptions,
  children
}) => {
  const documentRef = useRef<HTMLDivElement>(null);

  // Para URLs do Plone, precisamos de tratamento especial
  const isPlone = isPloneUrl(pdfUrl);

  console.log('Carregando PDF com URL:', pdfUrl, 'isPlone:', isPlone);

  // Memoiza as opções para evitar recriação desnecessária do objeto
  const memoizedOptions = useMemo(() => ({
    ...pdfOptions,
    withCredentials: isPlone,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
  }), [pdfOptions, isPlone]);

  return (
    <Document
      file={pdfUrl}
      onLoadSuccess={onLoadSuccess}
      onLoadError={(error) => {
        console.error('Erro ao carregar PDF:', error);
        onLoadError(error);
      }}
      className="flex flex-col items-center pb-4 bg-ufac-lightBlue"
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