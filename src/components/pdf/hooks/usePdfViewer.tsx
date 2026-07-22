
import { useToast } from '@/components/ui/use-toast';
import { useRef, useState } from 'react';
import { FitType, getMostVisiblePage } from '../utils/pdfUtils';

/**
 * Interface do estado do visualizador de PDF
 * @interface PdfViewerState
 * @property {number|null} numPages - Número total de páginas do documento
 * @property {number} pageNumber - Número da página atual
 * @property {string} pageInputValue - Valor do input do número da página
 * @property {number} scale - Escala de zoom do documento
 * @property {number} rotation - Rotação do documento em graus
 * @property {boolean} loading - Indica se o documento está sendo carregado
 * @property {boolean} error - Indica se houve erro no carregamento
 * @property {FitType} fitType - Tipo de ajuste do documento na tela
 * @property {boolean} isSearchMode - Indica se o modo de busca está ativo
 * @property {string} searchTerm - Termo de busca atual
 * @property {boolean} showSearchResults - Indica se os resultados da busca estão visíveis
 * @property {boolean} showThumbnails - Indica se as miniaturas estão visíveis
 * @property {string} fileUrl - URL do arquivo PDF
 */
export interface PdfViewerState {
  numPages: number | null;
  pageNumber: number;
  pageInputValue: string;
  scale: number;
  rotation: number;
  loading: boolean;
  error: boolean;
  fitType: FitType;
  isSearchMode: boolean;
  searchTerm: string;
  showSearchResults: boolean;
  showThumbnails: boolean;
  fileUrl: string;
  downloadUrl: string;
}

/**
 * Hook personalizado para gerenciar o estado e comportamento do visualizador de PDF
 */
export function usePdfViewer(fileUrl: string, downloadUrl?: string) {
  const [state, setState] = useState<PdfViewerState>({
    numPages: null,
    pageNumber: 1,
    pageInputValue: '1',
    scale: .5,
    rotation: 0,
    loading: true,
    error: false,
    fitType: 'width',
    isSearchMode: false,
    searchTerm: '',
    showSearchResults: false,
    showThumbnails: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
    fileUrl,
    downloadUrl: downloadUrl || fileUrl,
  });
  
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const updateState = (newState: Partial<PdfViewerState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    updateState({ numPages, loading: false, error: false });
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Erro ao carregar o PDF:', error);
    updateState({ loading: false, error: true });
    
    toast({
      title: "Erro ao carregar o documento",
      description: "Não foi possível visualizar este PDF. Tente baixá-lo ou abrir em nova aba.",
      variant: "destructive",
    });
  };

  /**
   * Rola o container do PDF até o topo da página (ou posição Y interna).
   * Usa scrollTop do container — scrollIntoView falha no mobile com overflow aninhado.
   */
  const scrollToPage = (pageNum: number, yPosition?: number) => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const pageElements = container.querySelectorAll('.react-pdf__Page');
    if (!pageElements.length || pageNum < 1 || pageNum > pageElements.length) return;

    const targetPage = pageElements[pageNum - 1] as HTMLElement;
    const pageRect = targetPage.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const pageTop =
      pageRect.top - containerRect.top + container.scrollTop;

    if (yPosition !== undefined) {
      container.scrollTo({
        top: Math.max(0, pageTop + yPosition - 100),
        behavior: 'smooth',
      });
      return;
    }

    container.scrollTo({
      top: Math.max(0, pageTop),
      behavior: 'smooth',
    });
  };

  /**
   * Manipulador de evento de rolagem
   * @description Detecta a página mais visível durante a rolagem e atualiza o estado
   */
  const handleScroll = () => {
    if (pdfContainerRef.current && state.numPages) {
      const mostVisiblePage = getMostVisiblePage(pdfContainerRef.current);
      if (mostVisiblePage && mostVisiblePage !== state.pageNumber) {
        updateState({
          pageNumber: mostVisiblePage,
          pageInputValue: mostVisiblePage.toString()
        });
      }
    }
  };

  /**
   * Manipulador para alteração do modo de busca
   * @param {boolean} active - Estado de ativação do modo de busca
   */
  const handleSearchModeChange = (active: boolean) => {
    updateState({ isSearchMode: active });
    if (!active) {
      updateState({ showSearchResults: false });
    }
  };

  /**
   * Manipulador para alteração do termo de busca
   * @param {string} term - Novo termo de busca
   */
  const handleSearchTermChange = (term: string) => {
    updateState({ searchTerm: term });
  };

  /**
   * Manipulador para resultados da busca
   * @param {boolean} hasResults - Indica se há resultados de busca
   */
  const handleSearchResults = (hasResults: boolean) => {
    updateState({ showSearchResults: hasResults });
  };

  return {
    state,
    updateState,
    pdfContainerRef,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    scrollToPage,
    handleScroll,
    handleSearchModeChange,
    handleSearchTermChange,
    handleSearchResults,
  };
}
