
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, StickyNote } from 'lucide-react';
import React from 'react';
import { Document, Page } from 'react-pdf';
import { usePdfViewerContext } from './context/PdfViewerContext';

interface PdfThumbnailBarProps {
  numPages: number;
  currentPage: number;
  onPageClick: (pageNumber: number) => void;
  className?: string;
}

const PdfThumbnailBar: React.FC<PdfThumbnailBarProps> = ({ 
  numPages, 
  currentPage, 
  onPageClick,
  className
}) => {
  const { state } = usePdfViewerContext();
  const { fileUrl } = state;

  if (!fileUrl) {
    return null;
  }

  return (
    <div className={`flex h-full w-[100px] flex-col border-r border-blue-100 bg-ufac-lightBlue sm:w-[120px] ${className ?? ''}`}>
      <div className="border-b border-blue-100/80 p-2 sm:p-3">
        <h3 className="flex items-center text-[10px] font-medium text-stone-400">
          <StickyNote className="mr-1.5 h-3.5 w-3.5" /> Páginas ({numPages})
        </h3>
      </div>
      
      <ScrollArea className="h-[calc(100%-44px)] w-full">
        <div className="flex flex-col gap-3 bg-ufac-lightBlue p-2 sm:gap-4 sm:p-3">
          <Document
            file={fileUrl}
            loading={
              <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando...
              </div>
            }
            error={
              <div className="text-center p-4 text-sm text-red-500">
                Erro ao carregar miniaturas
              </div>
            }
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={`thumb-${pageNum}`}
                className={`flex flex-col items-center cursor-pointer group transition-all ${
                  currentPage === pageNum ? 'scale-100 opacity-100' : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => onPageClick(pageNum)}
              >
                <div 
                  className={`flex flex-col items-center justify-center border-2 rounded-md transition-all ${
                    currentPage === pageNum ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white group-hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <Page 
                      pageNumber={pageNum}
                      width={70}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="thumbnail-page !rounded-none !mb-0 p-0"
                      loading={
                        <div className="text-xs text-gray-400 flex flex-col items-center justify-center">
                          <div className="text-sm text-gray-700 font-medium mb-1">
                            Página {pageNum}
                          </div>
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </div>
                      }
                    />
                  </div>
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  currentPage === pageNum ? 'text-blue-500' : 'text-gray-600'
                }`}>
                  {pageNum}
                </span>
              </div>
            ))}
          </Document>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PdfThumbnailBar;
