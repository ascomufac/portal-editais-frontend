
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useMemo } from 'react';
import { SearchResult } from '../utils/searchTypes';
import { PageSearchResultGroup } from '../utils/searchTypes';
import SearchResultItem from './SearchResultItem';

interface ResultsPanelProps {
  searchResults: SearchResult[];
  searchText: string;
  currentMatch: number;
  goToResult: (index: number) => void;
  clearSearch: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  searchResults,
  searchText,
  currentMatch,
  goToResult,
  clearSearch
}) => {
  // Group results by page number and count occurrences
  const groupedResultsArray = useMemo(() => {
    // Skip processing if no results
    if (searchResults.length === 0) {
      return [];
    }
    
    console.log('Processing search results to group by page');
    
    // Group results by page number
    const groupedResults = searchResults.reduce((acc, result) => {
      const pageNumber = result.pageNumber;
      if (!acc[pageNumber]) {
        acc[pageNumber] = {
          results: [],
          count: 0
        };
      }
      acc[pageNumber].results.push(result);
      acc[pageNumber].count = result.matchCount || 1; // Ensure we have a match count
      return acc;
    }, {} as Record<number, { results: SearchResult[], count: number }>);

    // Convert grouped results to an array and sort by page number
    return Object.entries(groupedResults).map(([pageNumber, data]) => ({
      pageNumber: parseInt(pageNumber),
      results: data.results,
      count: data.count,
      // Get the first result with the lowest top position for each page
      firstResult: data.results.sort((a, b) => 
        (a.position?.top || 0) - (b.position?.top || 0)
      )[0],
      searchTerm: searchText // Add the search term to each group
    })).sort((a, b) => a.pageNumber - b.pageNumber);
  }, [searchResults, searchText]);

  // Calculate total matches across all pages
  const totalMatches = useMemo(() => 
    groupedResultsArray.reduce((total, group) => total + group.count, 0),
    [groupedResultsArray]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-[#acb7d3] bg-ufac-lightBlue">
        <h3 className="font-medium text-gray-800">
          Resultados da busca ({totalMatches})
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Mostrando resultados para "{searchText}"
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-2 bg-ufac-lightBlue">
        {groupedResultsArray.length > 0 ? (
          groupedResultsArray.map((group) => {
            // Find the index of the firstResult in the original searchResults array
            const resultIndex = searchResults.findIndex(
              r => r.pageNumber === group.firstResult.pageNumber && 
                   r.position?.top === group.firstResult.position?.top
            );
            
            // Check if this page matches the current selected result
            const isCurrentResultPage = searchResults[currentMatch]?.pageNumber === group.pageNumber;
            
            return (
              <SearchResultItem 
                key={`page_${group.pageNumber}`}
                group={group}
                isCurrentMatch={isCurrentResultPage}
                resultIndex={resultIndex}
                onResultClick={goToResult}
              />
            );
          })
        ) : (
          <div className="p-3 text-center text-gray-500">
            {searchText ? (
              <>
                <p className="mb-2">Nenhum resultado encontrado.</p>
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Limpar busca
                </button>
              </>
            ) : (
              <p>Digite um termo para buscar no documento.</p>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ResultsPanel;
