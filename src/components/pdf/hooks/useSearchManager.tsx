
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { findTextInDocument } from '../utils/searchEngine';
import { SearchResult } from '../utils/searchTypes';

interface UseSearchManagerProps {
  scrollToPage: (pageNum: number, yPosition?: number) => void;
  onSearchModeChange: (active: boolean) => void;
  onSearchTermChange: (term: string) => void;
  onSearchResults: (hasResults: boolean) => void;
  externalSearchTerm?: string;
}

export const useSearchManager = ({
  scrollToPage,
  onSearchModeChange,
  onSearchTermChange,
  onSearchResults,
  externalSearchTerm
}: UseSearchManagerProps) => {
  const [searchText, setSearchText] = useState<string>(externalSearchTerm || '');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentMatch, setCurrentMatch] = useState<number>(-1);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [documentReady, setDocumentReady] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchAttemptCountRef = useRef<number>(0);
  const { toast } = useToast();
  
  const checkDocumentReady = useCallback(() => {
    const textLayers = document.querySelectorAll('.react-pdf__Page__textContent');
    
    if (textLayers && textLayers.length > 0) {
      console.log(`Document ready check: Found ${textLayers.length} text layers`);
      
      // Check for text spans within the text layers
      let totalSpans = 0;
      textLayers.forEach(layer => {
        const spans = layer.querySelectorAll('span');
        totalSpans += spans.length;
      });
      
      console.log(`Document ready check: Found ${totalSpans} text spans`);
      
      if (totalSpans > 0) {
        console.log('Document has text spans, ready for search');
        setDocumentReady(true);
        return true;
      }
    }
    
    console.log('Document not ready yet for search');
    return false;
  }, []);
  
  // More aggressive document ready checking on initial load
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Check immediately and then at increasing intervals
    if (!checkDocumentReady()) {
      const checkIntervals = [100, 300, 500, 1000, 2000, 3000, 5000];
      
      checkIntervals.forEach((delay, index) => {
        searchTimeoutRef.current = setTimeout(() => {
          if (checkDocumentReady() && searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
        }, delay);
      });
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [checkDocumentReady]);

  // Listen for PDF rendering events to detect when text content is available
  useEffect(() => {
    const handleTextLayerRendered = () => {
      setTimeout(checkDocumentReady, 100);
    };
    
    const handlePageRendered = () => {
      setTimeout(checkDocumentReady, 200);
    };
    
    document.addEventListener('textlayerrendered', handleTextLayerRendered);
    document.addEventListener('pagerendered', handlePageRendered);
    
    // Additional custom event for canvas rendering from PdfContent.tsx
    document.addEventListener('pageRenderedWithCanvas', handlePageRendered);
    
    return () => {
      document.removeEventListener('textlayerrendered', handleTextLayerRendered);
      document.removeEventListener('pagerendered', handlePageRendered);
      document.removeEventListener('pageRenderedWithCanvas', handlePageRendered);
    };
  }, [checkDocumentReady]);

  // Handle external search term changes
  useEffect(() => {
    if (externalSearchTerm && externalSearchTerm.trim().length > 0) {
      setSearchText(externalSearchTerm);
      
      if (documentReady) {
        console.log('External search term provided and document is ready, executing search');
        executeSearch(externalSearchTerm);
      } else {
        console.log('External search term provided but document not ready, will retry');
        const retryIntervals = [500, 1500, 3000, 5000];
        
        retryIntervals.forEach((delay, index) => {
          setTimeout(() => {
            if (documentReady) {
              console.log(`Document ready after ${delay}ms, executing search`);
              executeSearch(externalSearchTerm);
            } else if (index === retryIntervals.length - 1) {
              console.log('Final attempt: executing search regardless of document ready state');
              executeSearch(externalSearchTerm, true);
            }
          }, delay);
        });
      }
    } else if (externalSearchTerm?.trim().length === 0) {
      setSearchResults([]);
      setCurrentMatch(-1);
      setIsSearchActive(false);
      onSearchResults(false);
    }
  }, [externalSearchTerm, documentReady]);

  // Actual search execution function
  const executeSearch = useCallback((term: string, forceSearch = false) => {
    if (!term.trim()) return;
    
    searchAttemptCountRef.current += 1;
    const currentAttempt = searchAttemptCountRef.current;
    
    console.log(`🔍 Executing search for "${term}" (attempt ${currentAttempt})`);
    setIsSearching(true);
    setIsSearchActive(true);
    onSearchModeChange(true);
    onSearchTermChange(term.trim());
    
    if (!documentReady && !forceSearch) {
      console.log('Document not fully ready for search, but attempting anyway');
      toast({
        title: "Documento sendo carregado",
        description: "Tentando buscar enquanto o documento carrega, aguarde um momento...",
        variant: "default",
      });
    }
    
    // Small delay to allow UI to update
    setTimeout(() => {
      try {
        const startTime = performance.now();
        const { results } = findTextInDocument(term);
        const endTime = performance.now();
        console.log(`Search took ${(endTime - startTime).toFixed(2)}ms and found ${results.length} results`);
        
        setSearchResults(results);
        setIsSearching(false);
        
        if (results.length > 0) {
          setCurrentMatch(0);
          
          const firstResult = results[0];
          const yPosition = firstResult?.position?.top;
          
          scrollToPage(firstResult.pageNumber, yPosition);
          
          toast({
            title: "Resultados encontrados",
            description: `Encontrados ${results.length} resultados para "${term}"`,
          });
          
          setIsSearchActive(true);
          onSearchResults(true);
        } else {
          console.log('No results found in attempt', currentAttempt);
          
          // If this is the first search attempt and no results were found, 
          // try one more time after a short delay
          if (currentAttempt === 1) {
            console.log('First search attempt returned no results, retrying...');
            setTimeout(() => {
              executeSearch(term, true); // Force search on retry
            }, 800);
            return;
          }
          
          toast({
            title: "Nenhum resultado",
            description: `Nenhum resultado encontrado para "${term}"`,
            variant: "destructive",
          });
          
          onSearchResults(false);
          setIsSearchActive(false);
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        setIsSearching(false);
        toast({
          title: "Erro na busca",
          description: "Ocorreu um erro ao buscar no documento",
          variant: "destructive",
        });
      }
    }, 100);
  }, [documentReady, onSearchModeChange, onSearchTermChange, onSearchResults, scrollToPage, toast]);

  // Handle form submission for search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const term = searchText || externalSearchTerm || '';
    searchAttemptCountRef.current = 0; // Reset attempt counter for new searches
    executeSearch(term);
  }, [searchText, externalSearchTerm, executeSearch]);

  const goToResult = useCallback((index: number) => {
    console.log(`Going to result ${index}`);
    setCurrentMatch(index);
    const result = searchResults[index];
    const yPosition = result?.position?.top;
    scrollToPage(result.pageNumber, yPosition);
  }, [searchResults, scrollToPage]);

  const clearSearch = useCallback(() => {
    console.log('Clearing search');
    setSearchText('');
    setSearchResults([]);
    setCurrentMatch(-1);
    setIsSearchActive(false);
    onSearchModeChange(false);
    onSearchTermChange('');
    onSearchResults(false);
    searchAttemptCountRef.current = 0;
    
    document.querySelectorAll('.pdf-search-highlight-wrapper').forEach(el => {
      el.remove();
    });
  }, [onSearchModeChange, onSearchTermChange, onSearchResults]);

  return {
    searchText,
    setSearchText,
    isSearching,
    searchResults,
    currentMatch,
    documentReady,
    handleSearch,
    goToResult,
    clearSearch
  };
};
