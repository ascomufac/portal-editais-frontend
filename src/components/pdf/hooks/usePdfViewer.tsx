
import { useToast } from '@/components/ui/use-toast';
import { useRef, useState } from 'react';
import { FitType, getMostVisiblePage, isPloneUrl } from '../utils/pdfUtils';

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
}

/**
 * Hook personalizado para gerenciar o estado e comportamento do visualizador de PDF
 * @param {string} fileUrl - URL do arquivo PDF a ser exibido
 * @returns {Object} Objeto contendo estado e funções para controlar o visualizador
 * @description Gerencia o estado completo do visualizador de PDF, incluindo carregamento, 
 *              navegação, zoom, rotação, busca e outras funcionalidades.
 */
export function usePdfViewer(fileUrl: string) {
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
    showThumbnails: true,
    fileUrl,
  });
  
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  /**
   * Atualiza o estado do visualizador de PDF
   * @param {Partial<PdfViewerState>} newState - Estado parcial a ser atualizado
   */
  const updateState = (newState: Partial<PdfViewerState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  /**
   * Manipulador para quando o documento é carregado com sucesso
   * @param {{ numPages: number }} param0 - Objeto contendo o número de páginas
   */
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    updateState({ numPages, loading: false });
    
    // Mostra toast de sucesso se for uma URL do Plone
    if (isPloneUrl(fileUrl)) {
      toast({
        title: "Documento carregado com sucesso",
        description: `${numPages} páginas disponíveis para visualização.`,
        duration: 3000,
      });
    }
    
    // Aplica atributos de dados iniciais após carregamento bem-sucedido
    setTimeout(() => {
      if (pdfContainerRef.current) {
        const pageElements = pdfContainerRef.current.querySelectorAll('.react-pdf__Page');
        pageElements.forEach((page, index) => {
          const pageWrapper = page.closest('div');
          if (pageWrapper) {
            pageWrapper.setAttribute('data-page-number', String(index + 1));
          }
        });
      }
    }, 500);
  };

  /**
   * Manipulador para erros no carregamento do documento
   * @param {Error} error - Objeto de erro
   */
  const onDocumentLoadError = (error: Error) => {
    console.error('Erro ao carregar o PDF:', error);
    updateState({ loading: false, error: true });
    
    // Para URLs do Plone, oferece uma mensagem diferente
    if (isPloneUrl(fileUrl)) {
      toast({
        title: "Erro ao carregar o documento do Plone",
        description: "Tente abrir o documento em uma nova aba ou baixá-lo diretamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro ao carregar o documento",
        description: "Não foi possível visualizar este PDF. Tente baixá-lo.",
        variant: "destructive",
      });
    }
  };

  /**
   * Rola para uma página específica
   * @param {number} pageNum - Número da página para rolar
   * @param {number} [yPosition] - Posição Y opcional dentro da página
   */
  const scrollToPage = (pageNum: number, yPosition?: number) => {
    if (pdfContainerRef.current) {
      const pageElements = pdfContainerRef.current.querySelectorAll('.react-pdf__Page');
      if (pageElements && pageElements.length >= pageNum) {
        const targetPage = pageElements[pageNum - 1];
        
        // Se temos uma posição Y específica, rola para ela após a página estar em vista
        if (yPosition !== undefined) {
          // Primeiro rola para a página
          targetPage?.scrollIntoView({ behavior: 'auto', block: 'start' });
          
          // Depois rola para a posição específica dentro da página
          setTimeout(() => {
            if (pdfContainerRef.current) {
              const pageRect = targetPage.getBoundingClientRect();
              const containerRect = pdfContainerRef.current.getBoundingClientRect();
              const offsetTop = pageRect.top - containerRect.top + pdfContainerRef.current.scrollTop;
              
              // Calcula posição final de rolagem: posição superior da página + posição relativa da correspondência
              const scrollToY = offsetTop + yPosition - 100; // -100px de deslocamento para mostrar algum contexto acima
              
              pdfContainerRef.current.scrollTo({
                top: scrollToY,
                behavior: 'smooth'
              });
            }
          }, 100);
        } else {
          // Se não houver posição específica, apenas rola para a página
          targetPage?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
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
