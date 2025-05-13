import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { extractFileNameFromUrl, isPdf, searchDocuments, SearchResult } from '@/services/searchService';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileIcon from './icons/FileIcon';
import PdfIcon from './icons/PdfIcon';
import SearchIcon from './icons/SearchIcon';
import SearchFilter, { SearchSection } from './SearchFilter';
import SearchLoader from './SearchLoader';
import { Button } from './ui/button';
import { Input } from './ui/input';

const SearchBar: React.FC = () => {
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

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={searchBarRef}>    
      <div 
        className={cn(
          "overflow-hidden bg-white rounded-[28px] transition-all duration-200 shadow-sm",
          isFocused ? "ring-2 ring-ufac-blue" : "hover:shadow-md",
          isOpen && "shadow-lg " + (displayedResults.length === 0 ? 'ring-gray-200' : 'ring-ufac-blue' )
        )}
      >
        <div className="flex items-center px-5 py-3">
          <div className={cn(
            "flex items-center transition-colors",
            (isFocused ? "text-ufac-blue" : "text-gray-500")
          )}>
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
            className="flex-1 py-2 px-2 text-base bg-transparent border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
              />
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isOpen && searchQuery.length > 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-100"
            >
              {loading ? (
                <div className="py-4 px-4 text-center">
                  <SearchLoader size={40} className="mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Carregando resultados...</p>
                </div>
              ) : displayedResults.length > 0 ? (
                <>
                  <div className="p-2">
                    {displayedResults.map((result, index) => (
                      <a 
                        key={result.id} 
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex my-1 items-center gap-3 py-3 px-4 rounded-3xl cursor-pointer transition-colors duration-150",
                          index % 2 === 0 ? "bg-white" : "bg-[#F6F6F7]",
                          "hover:bg-ufac-lightBlue"
                        )}
                      >
                        {isPdf(result.url) ? <PdfIcon size={20} className='bg-red-100 flex items-center justify-center w-8 h-8 rounded-full p-2  min-w-8' /> : <FileIcon />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {getTitle(result)}
                          </div>
                          {result.date && (
                            <div className="text-xs text-gray-500 mt-1">
                              {getResultDate(result)}
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                  
                  {(hasMoreResults || totalResults > displayedResults.length) && (
                    <div className="mt-0 border-t border-gray-100">
                      <a 
                        href={`/resultados-busca?q=${encodeURIComponent(searchQuery)}&section=${selectedSection}`}
                        className="flex items-center justify-between w-full p-4 text-[#3366FF] font-medium rounded-b-[28px] transition-colors hover:bg-[#EEF3FF]"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSeeMoreResults();
                        }}
                      >
                        Ver mais resultados ({totalResults})
                        <ChevronRight className="h-5 w-5" />
                      </a>
                    </div>
                  )}
                </>
              ) : showNoResults && (
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
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchBar;
