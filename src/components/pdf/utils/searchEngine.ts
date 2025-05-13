
import { clearSearchHighlighting } from './searchHighlighter';
import { countSearchMatches, extractTextContext, generatePageThumbnail, getPageElement, getTextElements } from './searchTextExtraction';
import { SearchResult, SearchResultsSet } from './searchTypes';

/**
 * Main search functionality for finding text in PDF documents
 */

/**
 * Finds text matches in PDF document
 * @param searchText The text to search for
 * @returns Object containing search results
 */
export const findTextInDocument = (searchText: string): SearchResultsSet => {
  if (!searchText || searchText.trim() === '') {
    return { results: [] };
  }

  console.log('🔍 Starting search for:', searchText);

  // Clean up existing highlight wrappers
  clearSearchHighlighting();

  // Get all text elements from PDF pages
  const textElements = getTextElements();
  console.log(`Found ${textElements.length} text elements in document`);
  
  if (textElements.length === 0) {
    console.log('No text elements found after retry, falling back to alternative search');
    return handleNoTextElementsCase(searchText);
  }
  
  const searchLower = searchText.toLowerCase();
  const results: SearchResult[] = [];
  
  // Map to store text content for each page
  const pageTextMap: Map<number, string[]> = new Map();
  const pageMatchesMap: Map<number, number> = new Map();
  
  // First pass: organize text by page number and mark text elements
  let foundAnyMatch = false;
  
  textElements.forEach((element) => {
    const hasMatch = processTextElement(element, searchLower, pageTextMap, pageMatchesMap);
    if (hasMatch) foundAnyMatch = true;
  });
  
  if (!foundAnyMatch) {
    console.log("⚠️ No matches found in direct span search. Trying full page text search...");
    
    // Second attempt: try concatenated page text approach
    foundAnyMatch = searchConcatenatedPageText(searchText, pageTextMap, pageMatchesMap, results);
  }
  
  // Check if we found any matches at all
  const totalMatches = Array.from(pageMatchesMap.values()).reduce((sum, count) => sum + count, 0);
  console.log(`Total matches found: ${totalMatches}`);
  
  if (totalMatches === 0 && !foundAnyMatch) {
    // Third attempt: word-by-word approach
    return handleWordByWordSearch(searchText, textElements);
  }
  
  // Create search results by page with accurate match counts
  pageMatchesMap.forEach((matchCount, pageNum) => {
    if (matchCount > 0) {
      createPageResult(pageNum, matchCount, searchText, results);
    }
  });
  
  // Sort results by page number
  results.sort((a, b) => a.pageNumber - b.pageNumber);
  
  console.log('Search results:', results);
  
  // Ensure we always return results if matches were found
  if (foundAnyMatch && results.length === 0) {
    return createFallbackResults(searchText);
  }
  
  return { results };
};

/**
 * Process a single text element for search
 * @returns boolean indicating if a match was found
 */
const processTextElement = (
  element: Element, 
  searchLower: string, 
  pageTextMap: Map<number, string[]>, 
  pageMatchesMap: Map<number, number>
): boolean => {
  if (!element) return false;
  
  const pageElement = element.closest('.react-pdf__Page');
  if (!pageElement) return false;
  
  const pageWrapper = pageElement.closest('[data-page-number]');
  if (!pageWrapper) return false;
  
  const pageNum = parseInt(pageWrapper.getAttribute('data-page-number') || '0', 10);
  if (!pageNum) return false;
  
  // Get text from content or data attribute
  const text = element.textContent || element.getAttribute('data-text') || '';
  
  // Skip empty text
  if (!text.trim()) return false;
  
  if (!pageTextMap.has(pageNum)) {
    pageTextMap.set(pageNum, []);
    pageMatchesMap.set(pageNum, 0);
  }
  
  pageTextMap.get(pageNum)?.push(text);
  
  // Add data-text attribute to help with highlighting
  element.setAttribute('data-text', text);
  
  // Check if this specific element contains the search term
  const hasMatch = text.toLowerCase().includes(searchLower);
  
  if (hasMatch) {
    console.log(`✅ Match found in page ${pageNum}: "${text}"`);
    element.setAttribute('data-contains-search', 'true');
    
    // Count matches in this text element
    const matches = countSearchMatches(text, searchLower);
    
    // Increment match count for this page with the actual number of matches in this element
    const currentCount = pageMatchesMap.get(pageNum) || 0;
    pageMatchesMap.set(pageNum, currentCount + matches);
    
    return true;
  } else {
    element.removeAttribute('data-contains-search');
    return false;
  }
};

/**
 * Search for text in concatenated page text
 */
const searchConcatenatedPageText = (
  searchText: string,
  pageTextMap: Map<number, string[]>,
  pageMatchesMap: Map<number, number>,
  results: SearchResult[]
): boolean => {
  let foundAnyMatch = false;
  const searchLower = searchText.toLowerCase();

  pageTextMap.forEach((textArray, pageNum) => {
    const fullPageText = textArray.join(' ');
    
    if (fullPageText.toLowerCase().includes(searchLower)) {
      console.log(`🔍 Found match in page ${pageNum} full text`);
      
      // Get first element on the page to use for position
      const pageElement = getPageElement(pageNum);
      if (!pageElement) return;
      
      const firstTextElement = pageElement.querySelector('.react-pdf__Page__textContent span') as HTMLElement;
      if (!firstTextElement) return;
      
      // Count matches on this page
      const matches = countSearchMatches(fullPageText, searchText);
      
      foundAnyMatch = true; 
      pageMatchesMap.set(pageNum, matches);
      
      // Create a context extract
      const context = extractTextContext(fullPageText, searchText);
      
      // Add result for this page
      results.push({
        pageNumber: pageNum,
        text: `...${context}...`,
        matchCount: matches,
        position: {
          top: parseFloat(firstTextElement.style.top) || 0
        }
      });
    }
  });

  return foundAnyMatch;
};

/**
 * Create a search result for a specific page
 */
const createPageResult = (
  pageNum: number, 
  matchCount: number, 
  searchText: string,
  results: SearchResult[]
): void => {
  // Find the first occurrence on the page with its position
  const pageElement = getPageElement(pageNum);
  if (!pageElement) return;
  
  const matchElements = pageElement.querySelectorAll('[data-contains-search="true"]');
  
  if (matchElements.length > 0) {
    // Sort elements by their vertical position
    const sortedElements = Array.from(matchElements).sort((a, b) => {
      const aTop = parseFloat((a as HTMLElement).style.top);
      const bTop = parseFloat((b as HTMLElement).style.top);
      return aTop - bTop;
    });
    
    const firstMatchElement = sortedElements[0] as HTMLElement;
    const text = firstMatchElement.textContent || '';
    const context = extractTextContext(text, searchText, 80); // Increased context size
    
    // Generate thumbnail for this page
    const thumbnailUrl = generatePageThumbnail(pageElement);
    
    // Only add to results if we don't already have a result for this page
    if (!results.some(r => r.pageNumber === pageNum)) {
      results.push({
        pageNumber: pageNum,
        text: context || text,
        matchCount: matchCount,
        position: {
          top: parseFloat(firstMatchElement.style.top),
          left: parseFloat(firstMatchElement.style.left)
        },
        thumbnailUrl
      });
    }
  }
};

/**
 * Handle case when no text elements are found
 */
const handleNoTextElementsCase = (searchText: string): SearchResultsSet => {
  // Try an alternative approach using document content
  const documentText = document.body.textContent || '';
  if (documentText.toLowerCase().includes(searchText.toLowerCase())) {
    // We found the text but can't locate it precisely
    return { 
      results: [{
        pageNumber: 1,
        text: `Termo "${searchText}" encontrado no documento`,
        matchCount: 1,
        position: { top: 0 }
      }] 
    };
  }
  
  return { results: [] };
};

/**
 * Try word-by-word search approach
 */
const handleWordByWordSearch = (searchText: string, textElements: NodeListOf<Element>): SearchResultsSet => {
  console.log('No matches found in previous attempts. Trying word-by-word approach...');
  
  let fullText = '';
  textElements.forEach(el => {
    fullText += ' ' + (el.textContent || '');
  });
  
  if (fullText.toLowerCase().includes(searchText.toLowerCase())) {
    console.log('Search term found in concatenated document text');
    
    // Since we found the term but couldn't associate it with a page,
    // we'll return a basic result pointing to the first page
    return {
      results: [{
        pageNumber: 1,
        text: `Termo "${searchText}" encontrado no documento`,
        matchCount: 1,
        position: { top: 0 }
      }]
    };
  } else {
    console.log('Term not found in concatenated text either.');
    return { results: [] };
  }
};

/**
 * Create fallback results when matches were found but no formal results were created
 */
const createFallbackResults = (searchText: string): SearchResultsSet => {
  console.log('Found matches but no formal results - adding fallback result');
  const results: SearchResult[] = [];
  
  document.querySelectorAll('[data-contains-search="true"]').forEach((element) => {
    const pageElement = element.closest('.react-pdf__Page');
    if (!pageElement) return;
    
    const pageWrapper = pageElement.closest('[data-page-number]');
    if (!pageWrapper) return;
    
    const pageNum = parseInt(pageWrapper.getAttribute('data-page-number') || '0', 10);
    if (!pageNum) return;
    
    if (!results.some(r => r.pageNumber === pageNum)) {
      results.push({
        pageNumber: pageNum,
        text: element.textContent || `Encontrado na página ${pageNum}`,
        matchCount: 1,
        position: {
          top: parseFloat((element as HTMLElement).style.top) || 0
        }
      });
    }
  });
  
  // Last resort: just add a result for the first page
  if (results.length === 0) {
    results.push({
      pageNumber: 1,
      text: `Encontrado "${searchText}" no documento`,
      matchCount: 1,
      position: { top: 0 }
    });
  }
  
  return { results };
};
