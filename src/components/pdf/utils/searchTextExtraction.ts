
import { escapeRegExp } from './searchHighlighter';

/**
 * Utilities for extracting text from PDF documents for search operations
 */

/**
 * Extracts the context of text around a search term in a string
 * @param text - The text to search
 * @param searchTerm - The term to find context for
 * @param contextLength - Number of characters to include before and after
 * @returns Context string with the search term in the middle
 */
export const extractTextContext = (text: string, searchTerm: string, contextLength: number = 50): string => {
  if (!text || !searchTerm) return '';

  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());

  if (index === -1) return text;

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + searchTerm.length + contextLength);
  
  // Find sentence boundaries if possible
  let contextStart = start;
  let contextEnd = end;
  
  // Try to start at beginning of sentence
  for (let i = index; i > start; i--) {
    if ('. '.includes(text[i]) || i === 0) {
      contextStart = i === 0 ? 0 : i + 1;
      break;
    }
  }
  
  // Try to end at end of sentence
  for (let i = index + searchTerm.length; i < end && i < text.length; i++) {
    if ('. '.includes(text[i])) {
      contextEnd = i + 1;
      break;
    }
  }
  
  let result = text.substring(contextStart, contextEnd);
  
  // Add ellipsis if we're not at the beginning or end of the text
  if (contextStart > 0) result = '...' + result;
  if (contextEnd < text.length) result = result + '...';
  
  return result;
};

/**
 * Gets all text elements from the PDF pages
 * @returns NodeList of text span elements 
 */
export const getTextElements = (): NodeListOf<Element> => {
  const textElements = document.querySelectorAll('.react-pdf__Page__textContent span');
  
  if (textElements.length === 0) {
    console.log('No text elements found in the document, retrying...');
    // Force a redraw to make text elements visible
    document.querySelectorAll('.react-pdf__Page').forEach(page => {
      (page as HTMLElement).style.display = 'none';
      setTimeout(() => {
        (page as HTMLElement).style.display = '';
      }, 10);
    });
    
    return document.querySelectorAll('.react-pdf__Page__textContent span');
  }
  
  return textElements;
};

/**
 * Counts the number of matches of a search term in text
 * @param text - The text to search in
 * @param searchTerm - The term to count
 * @returns Number of matches found
 */
export const countSearchMatches = (text: string, searchTerm: string): number => {
  if (!text || !searchTerm) return 0;
  const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
  return (text.match(regex) || []).length;
};

/**
 * Gets the page element for a specific page number
 * @param pageNum - The page number to find
 * @returns The page element or null if not found
 */
export const getPageElement = (pageNum: number): Element | null => {
  return document.querySelector(`[data-page-number="${pageNum}"]`);
};

/**
 * Generates a thumbnail from a page's canvas
 * @param pageElement - The page element to generate thumbnail from
 * @returns Thumbnail URL as data URL
 */
export const generatePageThumbnail = (pageElement: Element): string => {
  let thumbnailUrl = '';
  try {
    const canvas = pageElement.querySelector('canvas');
    if (canvas) {
      // Create a small thumbnail by drawing the page to a smaller canvas
      const thumbCanvas = document.createElement('canvas');
      const ctx = thumbCanvas.getContext('2d');
      if (ctx) {
        // Set thumbnail dimensions (small enough to be lightweight)
        thumbCanvas.width = 100;
        thumbCanvas.height = (canvas.height / canvas.width) * 100;
        
        // Draw the page content scaled down
        ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
        thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.5); // Use JPEG with 50% quality for smaller size
      }
    }
  } catch (error) {
    console.error('Error generating thumbnail:', error);
  }
  return thumbnailUrl;
};
