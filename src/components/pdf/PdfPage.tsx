
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
  // 'zoom' = só scale (pinch / botões), sem travar na largura do container
  const width =
    fitType === 'width' || fitType === 'page'
      ? containerWidth
        ? containerWidth - 40
        : undefined
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
  
  // Marca d'água em grade, proporcional ao zoom
  const watermarkWidth = Math.max(72, Math.round(200 * scale));
  const watermarkGap = Math.max(24, Math.round(48 * scale));
  // Cobertura suficiente para A4 em qualquer zoom (grade 4x5)
  const watermarkTiles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div 
    ref={pageRef}
    className="my-10 shadow-2xl max-w-full rounded-3xl " 
    style={{ maxWidth: 'var(--pdf-page-max-width, 100%)', position: 'relative' }}
    data-page-number={pageNumber}
    >
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
      {/* Marca d'água repetida em grade, escala com o zoom */}
      <div
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 flex flex-wrap content-around justify-around opacity-25"
          style={{
            gap: watermarkGap,
            padding: watermarkGap,
            transform: 'rotate(-18deg) scale(1.25)',
            transformOrigin: 'center center',
          }}
        >
          {watermarkTiles.map((i) => (
            <div key={i} style={{ width: watermarkWidth }} className="shrink-0">
              <UfacLogo clasName="h-auto w-full" />
            </div>
          ))}
        </div>
      </div>
      </div>
  );
};

export default PdfPage;
