
/**
 * Type definitions for PDF search functionality
 */

/**
 * Represents a single search result
 */
export interface SearchResult {
  pageNumber: number;
  text: string;
  matchCount: number;
  position?: {
    top: number;
    left?: number;
  };
  thumbnailUrl?: string;
}

/**
 * Structure returned by search operations
 */
export interface SearchResultsSet {
  results: SearchResult[];
}

/**
 * Group of search results by page
 */
export interface PageSearchResultGroup {
  pageNumber: number;
  results: SearchResult[];
  count: number;
  firstResult: SearchResult;
  searchTerm: string;
}
