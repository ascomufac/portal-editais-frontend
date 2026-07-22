import React, { createContext, useContext } from 'react';
import { usePdfViewer, PdfViewerState } from '../hooks/usePdfViewer';

interface PdfViewerContextType {
  state: PdfViewerState;
  pdfContainerRef: React.RefObject<HTMLDivElement>;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError: (error: Error) => void;
  scrollToPage: (pageNum: number, yPosition?: number) => void;
  handleScroll: () => void;
  handleSearchModeChange: (active: boolean) => void;
  handleSearchTermChange: (term: string) => void;
  handleSearchResults: (hasResults: boolean) => void;
  updateState: (newState: Partial<PdfViewerState>) => void;
}

const PdfViewerContext = createContext<PdfViewerContextType | undefined>(undefined);

export const PdfViewerProvider: React.FC<{
  children: React.ReactNode;
  fileUrl: string;
  downloadUrl?: string;
}> = ({ children, fileUrl, downloadUrl }) => {
  const pdfViewerProps = usePdfViewer(fileUrl, downloadUrl);

  return (
    <PdfViewerContext.Provider value={pdfViewerProps}>
      {children}
    </PdfViewerContext.Provider>
  );
};

export const usePdfViewerContext = () => {
  const context = useContext(PdfViewerContext);
  if (context === undefined) {
    throw new Error('usePdfViewerContext deve ser usado dentro de um PdfViewerProvider');
  }
  return context;
};
