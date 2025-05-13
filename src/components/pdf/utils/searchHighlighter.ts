
/**
 * Utilities for highlighting search results in PDF text
 */

/**
 * Highlights specific search term in text by wrapping it in a span with highlight styling
 * This function preserves the original text but adds HTML for highlighting just the matching parts
 */
export const highlightSearchTermInText = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) return text;
  
  // Escape special characters in the search term for regex
  const escapedSearchTerm = escapeRegExp(searchTerm);
  
  // Create a case-insensitive regex for the search term
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  // Replace all occurrences of the search term with a highlighted version
  return text.replace(regex, '<span style="background-color: rgba(255, 80, 0, 1); color: #fff; border-radius: 2px; box-shadow: 0 0 0 2px rgba(255, 80, 0, 1); font-weight: bold; padding: 0 2px;">$1</span>');
};

/**
 * Applies highlighting to all elements that match the search term in the document
 * @param searchTerm - The term to highlight
 * @returns number of elements highlighted
 */
export const applySearchHighlighting = (searchTerm: string): number => {
  if (!searchTerm.trim()) return 0;
  
  // Clean up existing highlight wrappers first
  clearSearchHighlighting();
  
  // Find all text elements in the document
  const textElements = document.querySelectorAll('.react-pdf__Page__textContent span');
  console.log(`Found ${textElements.length} text elements to check for search term`);
  
  const searchLower = searchTerm.toLowerCase();
  let matchCount = 0;
  
  textElements.forEach((element) => {
    const text = element.textContent || '';
    
    // Check if this specific element contains the search term
    if (text.toLowerCase().includes(searchLower)) {
      matchCount++;
      // Generate HTML with highlighted search terms
      const htmlContent = highlightSearchTermInText(text, searchTerm);
      
      // Only apply if we have a match
      if (htmlContent !== text) {
        createHighlightWrapper(element as HTMLElement, htmlContent);
        element.setAttribute('data-contains-search', 'true');
      }
    }
  });
  
  console.log(`Applied highlighting to ${matchCount} matching elements`);
  return matchCount;
};

/**
 * Creates a highlight wrapper for a text element
 */
export const createHighlightWrapper = (element: HTMLElement, htmlContent: string): void => {
  // Create a wrapper to maintain position
  const wrapper = document.createElement('span');
  wrapper.className = 'pdf-search-highlight-wrapper';
  wrapper.style.position = 'absolute';
  wrapper.style.left = element.style.left;
  wrapper.style.top = element.style.top;
  wrapper.style.fontSize = element.style.fontSize;
  wrapper.style.fontFamily = element.style.fontFamily;
  wrapper.style.transform = element.style.transform;
  wrapper.style.transformOrigin = element.style.transformOrigin;
  wrapper.style.pointerEvents = 'none';
  wrapper.style.zIndex = '10';
  wrapper.innerHTML = htmlContent;
  
  // Add the highlighted version
  element.parentNode?.appendChild(wrapper);
};

/**
 * Clears all search highlighting from the document
 */
export const clearSearchHighlighting = (): void => {
  document.querySelectorAll('.pdf-search-highlight-wrapper').forEach(el => {
    el.remove();
  });
  
  // Also remove data attributes used for search
  document.querySelectorAll('[data-contains-search]').forEach(el => {
    el.removeAttribute('data-contains-search');
  });
};

/**
 * Helper function to escape special characters in search term
 */
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
