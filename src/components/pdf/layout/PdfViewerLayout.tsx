import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PanelLeft } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { usePdfViewerContext } from '../context/PdfViewerContext';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { useScrollToolbar } from '../hooks/useScrollToolbar';
import PdfFooter from '../PdfFooter';
import PdfLoadingError from '../PdfLoadingError';
import PdfSearch from '../PdfSearch';
import PdfThumbnailBar from '../PdfThumbnailBar';
import PdfToolbar from '../PdfToolbar';

interface PdfViewerLayoutProps {
  children: React.ReactNode;
  fileName?: string;
  /** tools: omite voltar/nome/baixar (chrome do shell pai). */
  toolbarVariant?: 'full' | 'tools';
}

const PdfViewerLayout: React.FC<PdfViewerLayoutProps> = ({
  children,
  fileName,
  toolbarVariant = 'full',
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

  const toolbar = (
    <PdfToolbar
      variant={toolbarVariant}
      displayFileName={displayFileName}
      fileUrl={downloadUrl || fileUrl}
      thumbnailToggle={
        state.numPages && state.numPages > 1 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleThumbnails}
            className={cn(
              'gap-1.5 text-gray-600',
              state.showThumbnails && 'bg-ufac-lightBlue text-ufac-blue'
            )}
            aria-label={
              state.showThumbnails ? 'Ocultar miniaturas' : 'Mostrar miniaturas'
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
  );

  // Miniaturas só fazem sentido com mais de uma página
  const showThumbnailPanel =
    state.showThumbnails && Boolean(state.numPages && state.numPages > 1);

  const footer =
    state.numPages && state.numPages > 0 ? (
      <PdfFooter
        numPages={state.numPages}
        pageNumber={state.pageNumber}
        setPageNumber={(pageNumber) => updateState({ pageNumber })}
        pageInputValue={state.pageInputValue}
        setPageInputValue={(pageInputValue) => updateState({ pageInputValue })}
        scrollToPage={scrollToPage}
        scale={state.scale}
        setScale={setScale}
      />
    ) : null;

  return (
    <div className="relative z-10 flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      {isMobile ? (
        <div
          className={cn(
            'pointer-events-none fixed inset-x-0 top-14 z-40 transition-transform duration-200 ease-out',
            toolbarVisible ? 'translate-y-0' : '-translate-y-full'
          )}
        >
          <div className="pointer-events-auto border-b border-gray-200 shadow-sm">
            {toolbar}
          </div>
        </div>
      ) : (
        <div className="z-20 shrink-0">{toolbar}</div>
      )}

      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        <PdfLoadingError
          loading={state.loading}
          error={state.error}
          fileUrl={downloadUrl || fileUrl}
        />

        {!state.error && (
          <>
            {showThumbnailPanel && state.numPages && (
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
              className="relative z-[1] min-h-0 min-w-0 flex-1 touch-pan-y overflow-auto overscroll-contain bg-ufac-lightBlue"
            >
              {isMobile && <div className="h-14 shrink-0" aria-hidden />}
              {children}
              {isMobile && footer && <div className="h-16 shrink-0" aria-hidden />}
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

      {footer &&
        (isMobile ? (
          <div
            className={cn(
              'pointer-events-none fixed inset-x-0 bottom-0 z-40 transition-transform duration-200 ease-out',
              toolbarVisible ? 'translate-y-0' : 'translate-y-full'
            )}
          >
            <div className="pointer-events-auto shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
              {footer}
            </div>
          </div>
        ) : (
          <div className="z-20 shrink-0">{footer}</div>
        ))}
    </div>
  );
};

export default PdfViewerLayout;
