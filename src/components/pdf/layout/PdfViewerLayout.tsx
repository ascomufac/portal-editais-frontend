import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PanelLeft } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { usePdfViewerContext } from '../context/PdfViewerContext';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { useScrollToolbar } from '../hooks/useScrollToolbar';
import PdfLoadingError from '../PdfLoadingError';
import PdfNavigation from '../PdfNavigation';
import PdfSearch from '../PdfSearch';
import PdfThumbnailBar from '../PdfThumbnailBar';
import PdfToolbar from '../PdfToolbar';

interface PdfViewerLayoutProps {
  children: React.ReactNode;
  fileName?: string;
}

const PdfViewerLayout: React.FC<PdfViewerLayoutProps> = ({
  children,
  fileName,
}) => {
  const isMobile = useIsMobile();
  const {
    state,
    pdfContainerRef,
    scrollToPage,
    handleSearchModeChange,
    handleSearchTermChange,
    handleSearchResults,
    updateState,
  } = usePdfViewerContext();

  const { fileUrl, downloadUrl } = state;
  const displayFileName =
    fileName ||
    (downloadUrl.startsWith('blob:')
      ? 'Documento'
      : downloadUrl.split('/').pop()?.replace(/@@download.*/, '') || 'Documento');

  // No mobile, miniaturas começam fechadas para liberar a área do PDF
  useEffect(() => {
    if (isMobile) {
      updateState({ showThumbnails: false, showSearchResults: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const setScale = useCallback(
    (scale: number) => {
      updateState({ scale, fitType: 'zoom' });
    },
    [updateState]
  );

  usePinchZoom(pdfContainerRef, state.scale, setScale, {
    enabled: isMobile && !state.loading && !state.error,
  });

  const toolbarVisible = useScrollToolbar(
    pdfContainerRef,
    isMobile && !state.loading && !state.error
  );

  const toggleThumbnails = () => {
    updateState({ showThumbnails: !state.showThumbnails });
  };

  return (
    <div className="relative z-10 flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <div
        className={cn(
          'z-20 shrink-0 overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out',
          toolbarVisible
            ? 'max-h-28 translate-y-0 opacity-100'
            : 'pointer-events-none max-h-0 -translate-y-2 opacity-0'
        )}
      >
        <PdfToolbar
          displayFileName={displayFileName}
          scale={state.scale}
          setScale={setScale}
          fitType={state.fitType}
          setFitType={(fitType) => updateState({ fitType })}
          fileUrl={downloadUrl || fileUrl}
          thumbnailToggle={
            state.numPages && state.numPages > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleThumbnails}
                className={cn(
                  'gap-1.5 text-gray-600',
                  state.showThumbnails && 'bg-ufac-lightBlue text-ufac-blue'
                )}
                aria-label={
                  state.showThumbnails
                    ? 'Ocultar miniaturas'
                    : 'Mostrar miniaturas'
                }
                aria-pressed={state.showThumbnails}
              >
                <PanelLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Páginas</span>
              </Button>
            ) : null
          }
          searchComponent={
            <PdfSearch
              scrollToPage={scrollToPage}
              onSearchModeChange={handleSearchModeChange}
              onSearchTermChange={handleSearchTermChange}
              onSearchResults={handleSearchResults}
            />
          }
        />
      </div>

      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        <PdfLoadingError
          loading={state.loading}
          error={state.error}
          fileUrl={downloadUrl || fileUrl}
        />

        {!state.error && (
          <>
            {state.showThumbnails && state.numPages > 0 && (
              <>
                {isMobile && (
                  <button
                    type="button"
                    className="absolute inset-0 z-10 bg-black/40"
                    aria-label="Fechar miniaturas"
                    onClick={() => updateState({ showThumbnails: false })}
                  />
                )}
                <PdfThumbnailBar
                  numPages={state.numPages}
                  currentPage={state.pageNumber}
                  onPageClick={(pageNumber) => {
                    scrollToPage(pageNumber);
                    updateState({
                      pageNumber,
                      pageInputValue: pageNumber.toString(),
                      ...(isMobile ? { showThumbnails: false } : {}),
                    });
                  }}
                  className={cn(
                    'z-20 shrink-0',
                    isMobile && 'absolute left-0 top-0 h-full shadow-xl'
                  )}
                />
              </>
            )}

            <div
              ref={pdfContainerRef}
              className="relative z-[1] min-h-0 min-w-0 flex-1 touch-pan-y overflow-auto bg-ufac-lightBlue"
            >
              {children}
            </div>

            {state.showSearchResults && (
              <div
                className={cn(
                  'z-[2] shrink-0 overflow-y-auto border-l border-gray-200 bg-white',
                  isMobile
                    ? 'absolute inset-y-0 right-0 w-[min(100%,20rem)] shadow-xl'
                    : 'w-1/4 min-w-[250px]'
                )}
              >
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
        <div
          className={cn(
            'z-20 shrink-0 overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out',
            isMobile
              ? toolbarVisible
                ? 'max-h-24 translate-y-0 opacity-100'
                : 'pointer-events-none max-h-0 translate-y-2 opacity-0'
              : 'max-h-24 opacity-100'
          )}
        >
          <PdfNavigation
            numPages={state.numPages}
            pageNumber={state.pageNumber}
            setPageNumber={(pageNumber) => updateState({ pageNumber })}
            pageInputValue={state.pageInputValue}
            setPageInputValue={(pageInputValue) =>
              updateState({ pageInputValue })
            }
            scrollToPage={scrollToPage}
          />
        </div>
      )}
    </div>
  );
};

export default PdfViewerLayout;
