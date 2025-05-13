
import React, { createContext, useContext } from 'react';
import { usePdfViewer, PdfViewerState } from '../hooks/usePdfViewer';

/**
 * Interface do contexto do visualizador de PDF
 * @interface PdfViewerContextType
 * @property {PdfViewerState} state - Estado do visualizador de PDF
 * @property {React.RefObject<HTMLDivElement>} pdfContainerRef - Referência para o contêiner do PDF
 * @property {function} onDocumentLoadSuccess - Manipulador para o carregamento bem-sucedido do documento
 * @property {function} onDocumentLoadError - Manipulador para o erro de carregamento do documento
 * @property {function} scrollToPage - Função para rolar para uma página específica
 * @property {function} handleScroll - Manipulador para o evento de rolagem
 * @property {function} handleSearchModeChange - Manipulador para alteração do modo de busca
 * @property {function} handleSearchTermChange - Manipulador para alteração do termo de busca
 * @property {function} handleSearchResults - Manipulador para resultados da busca
 * @property {function} updateState - Função para atualizar o estado
 */
interface PdfViewerContextType {
  state: PdfViewerState;
  pdfContainerRef: React.RefObject<HTMLDivElement>;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError: (error: Error) => void;
  scrollToPage: (pageNum: number) => void;
  handleScroll: () => void;
  handleSearchModeChange: (active: boolean) => void;
  handleSearchTermChange: (term: string) => void;
  handleSearchResults: (hasResults: boolean) => void;
  updateState: (newState: Partial<PdfViewerState>) => void;
}

/**
 * Contexto para o visualizador de PDF
 * @description Contexto React para compartilhar o estado e as funções do visualizador de PDF
 */
const PdfViewerContext = createContext<PdfViewerContextType | undefined>(undefined);

/**
 * Provedor de contexto para o visualizador de PDF
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Elementos filhos a serem renderizados
 * @param {string} props.fileUrl - URL do arquivo PDF
 * @returns {JSX.Element} Componente React renderizado
 * @description Provedor que disponibiliza funções e estado para o visualizador de PDF
 */
export const PdfViewerProvider: React.FC<{ 
  children: React.ReactNode;
  fileUrl: string;
}> = ({ children, fileUrl }) => {
  const pdfViewerProps = usePdfViewer(fileUrl);
  
  return (
    <PdfViewerContext.Provider value={pdfViewerProps}>
      {children}
    </PdfViewerContext.Provider>
  );
};

/**
 * Hook para usar o contexto do visualizador de PDF
 * @returns {PdfViewerContextType} Contexto do visualizador de PDF
 * @throws {Error} Erro se usado fora de um PdfViewerProvider
 * @description Permite acesso ao contexto do visualizador de PDF em componentes filhos
 */
export const usePdfViewerContext = () => {
  const context = useContext(PdfViewerContext);
  if (context === undefined) {
    throw new Error('usePdfViewerContext deve ser usado dentro de um PdfViewerProvider');
  }
  return context;
};
