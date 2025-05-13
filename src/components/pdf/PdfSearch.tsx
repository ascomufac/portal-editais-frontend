
import React from 'react';
import ResultsPanel from './search/ResultsPanel';
import SearchForm from './search/SearchForm';
import { useSearchManager } from './hooks/useSearchManager';

interface PdfSearchProps {
  scrollToPage: (pageNum: number, yPosition?: number) => void;
  onSearchModeChange: (active: boolean) => void;
  onSearchTermChange: (term: string) => void;
  onSearchResults: (hasResults: boolean) => void;
  showResultsPanel?: boolean;
  searchTerm?: string;
}

const PdfSearch: React.FC<PdfSearchProps> = ({ 
  scrollToPage, 
  onSearchModeChange,
  onSearchTermChange,
  onSearchResults,
  showResultsPanel = false,
  searchTerm: externalSearchTerm
}) => {
  const {
    searchText,
    setSearchText,
    isSearching,
    searchResults,
    currentMatch,
    handleSearch,
    goToResult,
    clearSearch
  } = useSearchManager({
    scrollToPage,
    onSearchModeChange,
    onSearchTermChange,
    onSearchResults,
    externalSearchTerm
  });

  return (
    <>
      {!showResultsPanel ? (
        <SearchForm 
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          isSearching={isSearching}
          clearSearch={clearSearch}
        />
      ) : (
        <ResultsPanel 
          searchResults={searchResults}
          searchText={searchText || externalSearchTerm || ''}
          currentMatch={currentMatch}
          goToResult={goToResult}
          clearSearch={clearSearch}
        />
      )}
    </>
  );
};

export default PdfSearch;
