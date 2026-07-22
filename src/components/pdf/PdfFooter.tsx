import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import React from 'react';

interface PdfFooterProps {
  numPages: number | null;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
  pageInputValue: string;
  setPageInputValue: (value: string) => void;
  scrollToPage: (pageNum: number) => void;
  scale: number;
  setScale: (scale: number) => void;
  className?: string;
}

/**
 * Footer do PDF: zoom + navegação de páginas.
 */
const PdfFooter: React.FC<PdfFooterProps> = ({
  numPages,
  pageNumber,
  setPageNumber,
  pageInputValue,
  setPageInputValue,
  scrollToPage,
  scale,
  setScale,
  className,
}) => {
  const { toast } = useToast();
  const total = numPages ?? 1;
  const canGoPrev = pageNumber > 1;
  const canGoNext = pageNumber < total;

  const goToPage = (pageNum: number) => {
    if (!numPages || pageNum < 1 || pageNum > numPages) return;
    setPageNumber(pageNum);
    setPageInputValue(String(pageNum));
    scrollToPage(pageNum);
  };

  const jumpToPage = (event: React.FormEvent) => {
    event.preventDefault();
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && numPages && pageNum <= numPages) {
      goToPage(pageNum);
    } else {
      setPageInputValue(pageNumber.toString());
      toast({
        title: 'Número de página inválido',
        description: `Digite um número entre 1 e ${numPages}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div
      className={cn(
        'z-20 flex shrink-0 items-center justify-between gap-2 border-t border-gray-200 bg-white px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:justify-center sm:gap-4 sm:px-3',
        className
      )}
    >
      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-0.5">
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-9 rounded-full"
          size="icon"
          onClick={() => setScale(Math.max(scale - 0.1, 0.1))}
          aria-label="Diminuir zoom"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[2.75rem] text-center text-xs tabular-nums text-gray-700 sm:text-sm">
          {Math.round(scale * 100)}%
        </span>
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-9 rounded-full"
          size="icon"
          onClick={() => setScale(Math.min(scale + 0.1, 3.0))}
          aria-label="Aumentar zoom"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {total > 1 && (
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            disabled={!canGoPrev}
            onClick={() => goToPage(pageNumber - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <form onSubmit={jumpToPage} className="flex items-center gap-1">
            <Input
              type="text"
              inputMode="numeric"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              className="h-9 w-11 text-center text-sm sm:w-14"
              aria-label="Número da página"
            />
            <span className="whitespace-nowrap text-xs text-gray-500 sm:text-sm">
              de {total}
            </span>
          </form>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            disabled={!canGoNext}
            onClick={() => goToPage(pageNumber + 1)}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfFooter;
