
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePdfViewerContext } from './context/PdfViewerContext';
import PdfDocumentView from './PdfDocumentView';
import { getPdfOptions } from './utils/pdfUtils';

const PdfContent: React.FC = () => {
  const {
    state,
    pdfContainerRef,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    handleScroll
  } = usePdfViewerContext();

  const searchAppliedRef = useRef<boolean>(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const { fileUrl } = state;
  const pdfOptions = useMemo(() => getPdfOptions(), []);
  const pdfUrl = useMemo(() => fileUrl, [fileUrl]);

  // Mede o container para fit-width / fit-page
  useEffect(() => {
    const el = pdfContainerRef.current;
    if (!el) return;

    const update = () => {
      setContainerSize({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pdfContainerRef, state.loading, state.numPages]);

  useEffect(() => {
    if (pdfContainerRef.current && state.numPages && !state.loading) {
      const pageElements = pdfContainerRef.current?.querySelectorAll('.react-pdf__Page');
      pageElements?.forEach((page, index) => {
        const pageWrapper = page.closest('div');
        if (pageWrapper) {
          pageWrapper.setAttribute('data-page-number', String(index + 1));
        }
      });
    }
  }, [state.numPages, state.loading, pdfContainerRef]);

  useEffect(() => {
    const container = pdfContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [state.numPages, state.pageNumber, handleScroll, pdfContainerRef]);

  // Add thumbnail generation capability
  useEffect(() => {
    // Define a custom event to notify when a page is fully rendered with canvas
    const pageRenderedEvent = new CustomEvent('pageRenderedWithCanvas');
    
    // Create a mutation observer to watch for canvas elements being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const canvas = node.querySelector('canvas');
              if (canvas && canvas.parentElement?.classList.contains('react-pdf__Page__canvas')) {
                // Dispatch custom event when canvas is added
                document.dispatchEvent(pageRenderedEvent);
              }
            }
          });
        }
      });
    });
    
    // Start observing the document with the configured parameters
    if (pdfContainerRef.current) {
      observer.observe(pdfContainerRef.current, { childList: true, subtree: true });
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Effect to handle search term changes
  useEffect(() => {
    if (state.searchTerm && !searchAppliedRef.current && state.numPages) {
      console.log('Search term changed, applying search:', state.searchTerm);
      // Mark that we have applied the search
      searchAppliedRef.current = true;
      
      // Trigger a re-render of the document to ensure search is applied
      // This is a hack but helps ensure search term is processed
      const container = pdfContainerRef.current;
      if (container) {
        // Force a reflow to help with search term application
        container.style.opacity = '0.99';
        setTimeout(() => {
          container.style.opacity = '1';
        }, 50);
      }
    } else if (!state.searchTerm) {
      searchAppliedRef.current = false;
    }
  }, [state.searchTerm, state.numPages]);

  // Inject global CSS for the PDF viewer
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'pdf-viewer-global-styles';
    styleEl.textContent = `
      /* Styles for the PDF container */
      .react-pdf__Document {
        line-height: initial !important;
      }
      
      /* Ensure pages don't overlap */
      .react-pdf__Page {
        margin: 0 auto !important;
        position: relative !important;
        overflow: hidden !important;
        max-width: 100% !important;
        background-color: #ffffff !important;
      }
      
      .react-pdf__Page__canvas {
        display: block !important;
        position: relative !important;
        z-index: 1 !important;
        margin: 0 auto !important;
        background-color: #ffffff !important;
      }
       /* Remove border-radius if inside thumbnail */
      .thumbnail-page .react-pdf__Page__canvas {
        // border-radius: 5em !important;
      }

      .thumbnail-page {
      overflow: hidden;
      }
      
      /* Additional adjustments to ensure correct text layer alignment */
      .react-pdf__Page__textContent {
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        transform: none !important;
        z-index: 2 !important;
      }
      
      /* Styling for search highlight wrappers */
      .pdf-search-highlight-wrapper {
        z-index: 5 !important;
        pointer-events: none !important;
      }
      
      /* Make text layer spans available for search but visually hidden */
      .react-pdf__Page__textContent span {
        color: transparent !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      const existingStyle = document.getElementById('pdf-viewer-global-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <PdfDocumentView 
      pdfUrl={pdfUrl}
      numPages={state.numPages}
      pageNumber={state.pageNumber}
      scale={state.scale}
      rotation={state.rotation}
      fitType={state.fitType}
      containerWidth={containerSize.width}
      containerHeight={containerSize.height}
      onLoadSuccess={onDocumentLoadSuccess}
      onLoadError={onDocumentLoadError}
      pdfOptions={pdfOptions}
      enableTextLayer={true}
      searchTerm={state.searchTerm}
    />
  );
};

export default PdfContent;
