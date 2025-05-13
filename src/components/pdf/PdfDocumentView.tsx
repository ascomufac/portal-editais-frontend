
import React, { useEffect } from 'react';
import { usePdfTextSelection } from './hooks/usePdfTextSelection';
import PdfDocument from './PdfDocument';
import PdfPage from './PdfPage';
import { FitType } from './utils/pdfUtils';
import { applySearchHighlighting, clearSearchHighlighting } from './utils/searchHighlighter';

// Import the PDF.js CSS for proper text layer rendering
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PdfDocumentViewProps {
  pdfUrl: string;
  numPages: number | null;
  pageNumber: number;
  scale: number;
  rotation: number;
  fitType: FitType;
  containerRef: HTMLDivElement | null;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
  pdfOptions: any;
  enableTextLayer?: boolean;
  searchTerm?: string;
}

const PdfDocumentView: React.FC<PdfDocumentViewProps> = ({
  pdfUrl,
  numPages,
  pageNumber,
  scale,
  rotation,
  fitType,
  containerRef,
  onLoadSuccess,
  onLoadError,
  pdfOptions,
  enableTextLayer = true,
  searchTerm = ''
}) => {
  // Use the hook to set up text selection
  usePdfTextSelection(searchTerm, enableTextLayer);
  
  // Add an effect to apply text search highlighting when the content is rendered
  useEffect(() => {
    if (!searchTerm || !enableTextLayer) return;
    
    console.log(`Applying highlighting for search term: ${searchTerm}`);
    
    // Clear existing highlights first
    clearSearchHighlighting();
    
    // Function to apply highlighting to text elements
    const applyHighlighting = () => {
      if (!searchTerm.trim()) return;
      
      console.log('Attempting to apply text highlighting');
      const matchCount = applySearchHighlighting(searchTerm);
      
      if (matchCount === 0) {
        console.log('No matches found in first attempt, will retry');
        // Retry with increasing intervals for better success rates
        const retryDelays = [200, 500, 1000, 2000];
        
        retryDelays.forEach((delay, index) => {
          setTimeout(() => {
            console.log(`Retry ${index + 1} for search highlighting after ${delay}ms`);
            const newMatchCount = applySearchHighlighting(searchTerm);
            if (newMatchCount > 0) {
              console.log(`Success! Highlighted ${newMatchCount} matches on retry ${index + 1}`);
            }
          }, delay);
        });
      } else {
        console.log(`Applied highlighting to ${matchCount} matching elements`);
      }
    };
    
    // Set up event listener for text layer rendering
    const handleTextLayerRendered = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(`Text layer rendered for page ${customEvent.detail?.pageNumber || 'unknown'}`);
      setTimeout(applyHighlighting, 100);
    };
    
    document.addEventListener('textlayerrendered', handleTextLayerRendered);
    
    // Run once immediately and retry a few times to ensure success
    applyHighlighting();
    
    return () => {
      document.removeEventListener('textlayerrendered', handleTextLayerRendered);
      // Clean up any highlight wrappers when unmounting or search term changes
      clearSearchHighlighting();
    };
  }, [searchTerm, enableTextLayer, numPages, pageNumber]);

  // Additional effect to handle document loading completion
  useEffect(() => {
    if (numPages && numPages > 0) {
      console.log(`Document loaded with ${numPages} pages, setting up event dispatching`);
      
      // Dispatch event to notify that the document is loaded
      const documentLoadedEvent = new CustomEvent('pdfDocumentLoaded', { 
        detail: { numPages }
      });
      document.dispatchEvent(documentLoadedEvent);
    }
  }, [numPages]);

  return (
    <PdfDocument
      pdfUrl={pdfUrl}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      pdfOptions={pdfOptions}
    >
      {numPages && numPages > 0 ? (
        <div className="pages-container w-ful bg-ufac-lightBlue">
          {Array.from(new Array(numPages), (_, index) => (
            <PdfPage
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              rotation={rotation}
              fitType={fitType}
              containerWidth={containerRef?.clientWidth}
              containerHeight={containerRef?.clientHeight}
              isCurrentPage={index + 1 === pageNumber}
              enableTextLayer={enableTextLayer}
            />
          ))}
        </div>
      ) : null}
    </PdfDocument>
  );
};

export default PdfDocumentView;
