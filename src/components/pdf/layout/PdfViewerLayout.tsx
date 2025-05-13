
import React from 'react';
import { usePdfViewerContext } from '../context/PdfViewerContext';
import PdfLoadingError from '../PdfLoadingError';
import PdfNavigation from '../PdfNavigation';
import PdfSearch from '../PdfSearch';
import PdfThumbnailBar from '../PdfThumbnailBar';
import PdfToolbar from '../PdfToolbar';

/**
 * Interface para as propriedades do componente PdfViewerLayout
 * @interface PdfViewerLayoutProps
 * @property {React.ReactNode} children - Elementos filhos a serem renderizados
 * @property {string} [fileName] - Nome do arquivo PDF
 */
interface PdfViewerLayoutProps {
  children: React.ReactNode;
  fileName?: string;
}

/**
 * Componente de layout para o visualizador de PDF
 * @param {PdfViewerLayoutProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 */
const PdfViewerLayout: React.FC<PdfViewerLayoutProps> = ({ 
  children, 
  fileName 
}) => {
  const {
    state,
    pdfContainerRef,
    scrollToPage,
    handleSearchModeChange,
    handleSearchTermChange,
    handleSearchResults,
    updateState
  } = usePdfViewerContext();

  const { fileUrl } = state;
  const displayFileName = fileName || fileUrl.split('/').pop() || 'Documento';

  // Adiciona um novo estado para controlar a visibilidade das miniaturas
  const toggleThumbnails = () => {
    updateState({ showThumbnails: !state.showThumbnails });
  };


  return (
    <div className="flex flex-col w-full h-full bg-white relative z-10">
      
      <PdfToolbar 
        displayFileName={displayFileName}
        scale={state.scale}
        setScale={(scale) => updateState({ scale })}
        fitType={state.fitType}
        setFitType={(fitType) => updateState({ fitType })}
        fileUrl={fileUrl}
        searchComponent={
          <PdfSearch 
            scrollToPage={scrollToPage} 
            onSearchModeChange={handleSearchModeChange}
            onSearchTermChange={handleSearchTermChange}
            onSearchResults={handleSearchResults}
          />
        }
        // Pode ativar e desativar a lista de páginas 
        // thumbnailToggle={
        //   <Button 
        //     variant="outline" 
        //     size="sm"
        //     onClick={toggleThumbnails}
        //     className={state.showThumbnails ? "bg-gray-100" : ""}
        //   >
        //     <StickyNote className="h-4 w-4 mr-1" />
        //     Páginas
        //   </Button>
        // }
      />

      <div className="w-full relative overflow-hidden flex">
        <PdfLoadingError 
          loading={state.loading}
          error={state.error}
          fileUrl={fileUrl}
        />
        
        {!state.error && (
          <>
            {/* Painel de miniaturas no lado esquerdo quando habilitado */}
            {state.showThumbnails && state.numPages > 0 && (
              <PdfThumbnailBar
                numPages={state.numPages}
                currentPage={state.pageNumber}
                onPageClick={(pageNumber) => {
                  scrollToPage(pageNumber);
                  updateState({ pageNumber, pageInputValue: pageNumber.toString() });
                }}
                className="flex-shrink-0"
              />
            )}
            
            {/* Conteúdo principal do PDF */}
            <div 
              ref={pdfContainerRef}
              className="h-full overflow-auto bg-ufac-lightBlue flex-1 relative"
              style={{ zIndex: 1 }}
            >
              {children}
            </div>
            
            {/* Painel de resultados de busca no lado direito */}
            {state.showSearchResults && (
              <div className="w-1/4 min-w-[250px] border-l border-gray-200 overflow-y-auto bg-white flex-shrink-0" style={{ zIndex: 2 }}>
                <PdfSearch 
                  scrollToPage={scrollToPage}
                  onSearchModeChange={handleSearchModeChange}
                  onSearchTermChange={handleSearchTermChange}
                  onSearchResults={handleSearchResults}
                  showResultsPanel={true}
                  searchTerm={state.searchTerm}
                />
              </div>
            )}
          </>
        )}
      </div>

      {state.numPages > 0 && (
        <PdfNavigation 
          numPages={state.numPages}
          pageNumber={state.pageNumber}
          setPageNumber={(pageNumber) => updateState({ pageNumber })}
          pageInputValue={state.pageInputValue}
          setPageInputValue={(pageInputValue) => updateState({ pageInputValue })}
          scrollToPage={scrollToPage}
        />
      )}
    </div>
  );
};

export default PdfViewerLayout;
