import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getPloneDownloadUrl } from '@/components/pdf/utils/pdfUtils';
import { toEditalHref } from '@/services/editalService';
import { extractFileNameFromUrl, searchDocuments, SearchResult } from '@/services/searchService';
import { isPdf } from '@/services/search/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Copy, Download, Eye, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileTypeIcon from './icons/FileTypeIcon';
import SearchIcon from './icons/SearchIcon';
import SearchFilter, { SearchSection } from './SearchFilter';
import SearchLoader from './SearchLoader';
import { Button } from './ui/button';
import { Input } from './ui/input';

const getResultAppHref = (result: SearchResult): string => {
  if (isPdf(result.url, result.title)) {
    return `/visualizar-pdf/${encodeURIComponent(result.url)}`;
  }
  try {
    return toEditalHref(result.url);
  } catch {
    return result.url;
  }
};

const SearchBar: React.FC<{
  compact?: boolean;
  autoFocus?: boolean;
  onRequestClose?: () => void;
}> = ({ compact = false, autoFocus = false, onRequestClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SearchSection>('all');
  const [showNoResultsMessage, setShowNoResultsMessage] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      setIsFocused(true);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!onRequestClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onRequestClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onRequestClose]);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length > 2) {
        setLoading(true);
        setShowNoResultsMessage(false);
        try {
          const response = await searchDocuments(searchQuery, selectedSection);
          setResults(response.items);
          setTotalResults(response.total);
          setIsOpen(true);
          
          if (response.items.length === 0) {
            setShowNoResultsMessage(true);
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
          toast({
            title: "Erro na busca",
            description: "Ocorreu um erro ao buscar. Tente novamente mais tarde.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setTotalResults(0);
        setIsOpen(false);
        setShowNoResultsMessage(false);
      }
    };

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.length > 2) {
      searchTimeout.current = window.setTimeout(fetchResults, 600) as unknown as number;
    } else {
      setResults([]);
      setTotalResults(0);
      setIsOpen(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, selectedSection]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
    setShowNoResultsMessage(false);
    inputRef.current?.focus();
  };

  const handleSeeMoreResults = () => {
    navigate(`/resultados-busca?q=${encodeURIComponent(searchQuery)}&section=${selectedSection}`);
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery.length > 2) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
  };

  const handleSectionChange = (section: SearchSection) => {
    setSelectedSection(section);
    if (searchQuery.length > 2) {
      setLoading(true);
      setIsOpen(true);
    }
  };

  const handleAnimationComplete = () => {
    setShowNoResultsMessage(true);
  };

  const displayedResults = results.slice(0, 5);
  const hasMoreResults = results.length > 5;

  const getTitle = (result: SearchResult) => {
    return result.title || extractFileNameFromUrl(result.url);
  };

  const getResultDate = (result: SearchResult) => {
    if (!result.date) return '';
    
    try {
      const date = new Date(result.date);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return result.date;
    }
  };

  const showNoResults = searchQuery.length > 2 && !loading && results.length === 0;

  const closeAndGo = (href: string) => {
    setIsOpen(false);
    onRequestClose?.();
    navigate(href);
  };

  const handleOpenResult = (result: SearchResult) => {
    if (isPdf(result.url, result.title)) {
      closeAndGo(`/visualizar-pdf/${encodeURIComponent(result.url)}`);
      return;
    }
    if (result.type === 'File') {
      const link = getPloneDownloadUrl(result.url) || result.url;
      window.open(link, '_blank', 'noopener,noreferrer');
      setIsOpen(false);
      onRequestClose?.();
      return;
    }
    closeAndGo(getResultAppHref(result));
  };

  const handleViewPdf = (result: SearchResult, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeAndGo(`/visualizar-pdf/${encodeURIComponent(result.url)}`);
  };

  const handleCopyUrl = async (result: SearchResult, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const link = getPloneDownloadUrl(result.url) || result.url;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (result: SearchResult, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const link = getPloneDownloadUrl(result.url) || result.url;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const resultsPanel = isOpen && searchQuery.length > 2 && (
    <motion.div
      key="search-results"
      initial={{ opacity: 0, ...(compact ? { y: -4 } : { height: 0 }) }}
      animate={{ opacity: 1, ...(compact ? { y: 0 } : { height: 'auto' }) }}
      exit={{ opacity: 0, ...(compact ? { y: -4 } : { height: 0 }) }}
      transition={{ duration: 0.2 }}
      className={cn(
        'overflow-hidden bg-white shadow-lg',
        compact
          ? 'absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[min(70vh,calc(100dvh-4.5rem))] overflow-y-auto rounded-xl border border-gray-100'
          : 'border-t border-gray-100'
      )}
    >
      {loading ? (
        <div className="py-4 px-4 text-center">
          <SearchLoader size={40} className="mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Carregando resultados...</p>
        </div>
      ) : displayedResults.length > 0 ? (
        <>
          <div className="p-2">
            {displayedResults.map((result, index) => {
              const pdf = isPdf(result.url, result.title);
              const isFile = pdf || result.type === 'File';

              return (
                <div
                  key={result.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenResult(result)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenResult(result);
                    }
                  }}
                  className={cn(
                    'my-1 flex items-center gap-2 rounded-2xl px-3 py-2.5 transition-colors duration-150 cursor-pointer',
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F6F6F7]',
                    'hover:bg-ufac-lightBlue'
                  )}
                >
                  <FileTypeIcon
                    source={result.url}
                    sources={[result.title]}
                    size={20}
                    className="flex h-8 w-8 min-w-8 items-center justify-center rounded-full p-1.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-800">
                      {getTitle(result)}
                    </div>
                    {result.date && (
                      <div className="mt-0.5 text-xs text-gray-500">
                        {getResultDate(result)}
                      </div>
                    )}
                  </div>

                  {isFile && (
                    <div className="flex shrink-0 items-center gap-0.5">
                      {pdf && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-ufac-blue"
                          title="Visualizar no app"
                          onClick={(e) => handleViewPdf(result, e)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-gray-500 hover:text-ufac-blue"
                        title="Copiar link"
                        onClick={(e) => handleCopyUrl(result, e)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-gray-500 hover:text-ufac-blue"
                        title="Baixar"
                        onClick={(e) => handleDownload(result, e)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {(hasMoreResults || totalResults > displayedResults.length) && (
            <div className="mt-0 border-t border-gray-100">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-b-xl p-4 font-medium text-[#3366FF] transition-colors hover:bg-[#EEF3FF]"
                onClick={handleSeeMoreResults}
              >
                Ver mais resultados ({totalResults})
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        showNoResults && (
          <div className="py-6 px-4 text-center">
            <SearchLoader
              size={40}
              noResults={true}
              className="mx-auto mb-4"
              onAnimationComplete={handleAnimationComplete}
            />
            {showNoResultsMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-500"
              >
                Nenhum resultado encontrado para "{searchQuery}"
              </motion.p>
            )}
          </div>
        )
      )}
    </motion.div>
  );

  return (
    <div
      className={cn(
        'relative w-full',
        compact ? 'max-w-xl' : 'max-w-3xl mx-auto'
      )}
      ref={searchBarRef}
    >
      <div
        className={cn(
          'overflow-hidden bg-white transition-all duration-200 shadow-sm',
          compact ? 'rounded-xl' : 'rounded-[28px]',
          isFocused ? 'ring-2 ring-white/80' : 'hover:shadow-md',
          isOpen && !compact && 'shadow-lg ring-1 ring-white/50'
        )}
      >
        <div
          className={cn(
            'flex items-center',
            compact ? 'px-3 py-1.5' : 'px-5 py-3'
          )}
        >
          <div
            className={cn(
              'flex items-center transition-colors',
              isFocused ? 'text-ufac-blue' : 'text-gray-500'
            )}
          >
            <SearchIcon />
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar edital"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
              compact ? 'h-8 px-2 text-sm' : 'py-2 px-2 text-base'
            )}
          />
          <div className="flex items-center gap-1">
            {searchQuery.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="Limpar pesquisa"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="h-8 pl-1 border-l border-gray-200">
              <SearchFilter
                selectedSection={selectedSection}
                onSectionChange={handleSectionChange}
                compact={compact}
              />
            </div>
          </div>
        </div>

        {!compact && <AnimatePresence>{resultsPanel}</AnimatePresence>}
      </div>

      {compact && <AnimatePresence>{resultsPanel}</AnimatePresence>}
    </div>
  );
};

export default SearchBar;
