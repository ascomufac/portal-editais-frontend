
import React from 'react';
import { PageSearchResultGroup } from '../utils/searchTypes';

interface SearchResultItemProps {
  group: PageSearchResultGroup;
  isCurrentMatch: boolean;
  resultIndex: number;
  onResultClick: (index: number) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  group,
  isCurrentMatch,
  resultIndex,
  onResultClick
}) => {
  // Function to highlight the search term in the text preview
  const highlightMatchInText = (text: string, searchText: string): JSX.Element => {
    if (!text || !searchText) return <>{text}</>;
    
    try {
      // Create parts by splitting on the search term (case insensitive)
      const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedSearchText})`, 'gi');
      const parts = text.split(regex);
      
      return (
        <>
          {parts.map((part, i) => {
            // Check if this part matches the search term (case insensitive)
            const isMatch = part.toLowerCase() === searchText.toLowerCase();
            
            return isMatch ? (
              <span key={i} className="bg-orange-500 text-white font-medium px-1 rounded">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            );
          })}
        </>
      );
    } catch (e) {
      console.error('Error highlighting text:', e);
      return <>{text}</>;
    }
  };
  
  return (
    <div 
      key={`page_${group.pageNumber}`}
      className={`p-3 mb-2 rounded-2xl hover:bg-gray-100 cursor-pointer transition-all ${
        isCurrentMatch ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-200"
      }`}
      onClick={() => onResultClick(resultIndex >= 0 ? resultIndex : 0)}
      title="Clique para ir até este resultado"
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail preview */}
        {group.firstResult.thumbnailUrl && (
          <div className="flex-shrink-0 w-[60px] h-[80px] overflow-hidden rounded border border-gray-200">
            <img 
              src={group.firstResult.thumbnailUrl} 
              alt={`Página ${group.pageNumber}`}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 justify-between mb-1">
            <span className="text-xs font-semibold bg-gray-200 rounded-full px-2 py-0.5">
              Pág. {group.pageNumber}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {group.count} {group.count === 1 ? 'ocorrência' : 'ocorrências'}
            </span>
          </div>
          <p className="text-sm line-clamp-3">
            {highlightMatchInText(group.firstResult.text, group.searchTerm)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchResultItem;
