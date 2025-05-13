
import { Loader2 } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { Page } from 'react-pdf';
import { UfacLogo } from '../sidebar/SidebarIcons';
import { FitType } from './utils/pdfUtils';

interface PdfPageProps {
  pageNumber: number;
  scale: number;
  rotation: number;
  fitType: FitType;
  containerWidth?: number;
  containerHeight?: number;
  isCurrentPage: boolean;
  enableTextLayer: boolean;
}

const PdfPage: React.FC<PdfPageProps> = ({
  pageNumber,
  scale,
  rotation,
  fitType,
  containerWidth,
  containerHeight,
  isCurrentPage,
  enableTextLayer,
}) => {
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Calculate dimensions based on fit type
  const width = fitType === 'width' || fitType === 'page' 
    ? (containerWidth ? containerWidth - 40 : undefined) 
    : undefined;
  
  const height = fitType === 'page' 
    ? (containerHeight ? containerHeight - 40 : undefined) 
    : undefined;

  // Set the data page number attribute and handle text content
  useEffect(() => {
    if (!pageRef.current) return;
    
    // Set the page number attribute on this component
    pageRef.current.setAttribute('data-page-number', pageNumber.toString());
    // console.log(`Set data-page-number=${pageNumber} on page element`);
    
    // Handle text content once the page is rendered
    const handlePageRendered = () => {
      if (!pageRef.current) return;
      
      // Find the text content element within this page
      const textLayer = pageRef.current.querySelector('.react-pdf__Page__textContent');
      if (textLayer) {
        // Mark the text layer with a specific class for easier selection
        textLayer.classList.add('textLayer');
        
        // Make sure text content is properly indexed but visually hidden
        // This is crucial for search functionality
        const style = document.createElement('style');
        style.textContent = `
          .react-pdf__Page__textContent {
            opacity: 0.2 !important; /* Make slightly visible for debugging */
            z-index: 10 !important; /* Ensure it's above the page content */
            pointer-events: auto !important;
          }
          .react-pdf__Page__textContent span {
            color: transparent !important;
            pointer-events: auto !important;
            user-select: text !important;
          }
        `;
        textLayer.appendChild(style);
        
        // Set data attributes on each text span to help with text selection and search
        const textSpans = textLayer.querySelectorAll('span');
        // console.log(`Page ${pageNumber} has ${textSpans.length} text spans`);
        
        textSpans.forEach(span => {
          const text = span.textContent || '';
          span.setAttribute('data-text', text);
          
          // Add a class to make it easier to query
          span.classList.add('pdf-text-span');
          
          // Log some text spans for debugging (only first 2 for each page)
          if (textSpans.length > 0 && Array.from(textSpans).indexOf(span) < 2) {
            // console.log(`Page ${pageNumber} text span: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
          }
        });
        
        // console.log(`Page ${pageNumber} text layer processed with ${textSpans.length} text spans`);
        
        // Dispatch a custom event to signal text layer is ready
        const event = new CustomEvent('textlayerrendered', { 
          detail: { pageNumber }
        });
        document.dispatchEvent(event);
      } else {
        // console.log(`No text layer found for page ${pageNumber}`);
      }
    };
    
    // Add event listener for page rendering
    const pageElement = pageRef.current.querySelector('.react-pdf__Page');
    if (pageElement) {
      pageElement.addEventListener('pagerendered', handlePageRendered);
      
      // Also try to run once immediately for already rendered pages
      setTimeout(handlePageRendered, 100);
      // Try again after a longer delay to catch late-rendering text layers
      setTimeout(handlePageRendered, 1000);
    }
    
    return () => {
      if (pageElement) {
        pageElement.removeEventListener('pagerendered', handlePageRendered);
      }
    };
  }, [pageNumber, scale, rotation]);
  
  return (
    <div 
    ref={pageRef}
    className="my-10 shadow-2xl max-w-full rounded-3xl " 
    style={{ maxWidth: 'var(--pdf-page-max-width, 100%)', position: 'relative' }}
    data-page-number={pageNumber}
    >
      <UfacLogo clasName='absolute bottom-1 z-10 w-40 h-10 opacity-20 right-8 mb-2' />
      <Page 
        key={`page_${pageNumber}_${rotation}_${scale}_${fitType}`}
        pageNumber={pageNumber} 
        scale={scale}
        rotate={rotation}
        width={width}
        height={height}
        renderAnnotationLayer={true}
        renderTextLayer={enableTextLayer}
        canvasBackground="#ffffff"
        className={`${isCurrentPage ? 'border-4 border-ufac-blue ' : ''} rounded-2xl overflow-hidden`}
        loading={
          <div className="w-full  h-[400px] flex items-center justify-center bg-gray-50">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        }
        error={
          <div className="w-full h-[400px] flex items-center justify-center bg-gray-50">
            <p className="text-red-500">Erro ao carregar a página.</p>
          </div>
        }
        customTextRenderer={({ str }) => str}
        onLoadSuccess={() => {
          // console.log(`Page ${pageNumber} loaded successfully`);
        }}
      />
      </div>
  );
};

export default PdfPage;
