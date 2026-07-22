import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PdfNavigationProps {
  numPages: number | null;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
  pageInputValue: string;
  setPageInputValue: (value: string) => void;
  scrollToPage: (pageNum: number) => void;
  /** Compacto para a toolbar no mobile */
  compact?: boolean;
  className?: string;
}

const PdfNavigation: React.FC<PdfNavigationProps> = ({
  numPages,
  pageNumber,
  setPageNumber,
  pageInputValue,
  setPageInputValue,
  scrollToPage,
  compact = false,
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

  if (compact) {
    return (
      <div className={cn('flex items-center gap-0.5', className)}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          disabled={!canGoPrev}
          onClick={() => goToPage(pageNumber - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="min-w-[3.25rem] text-center text-xs tabular-nums text-gray-600">
          {pageNumber}/{total}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          disabled={!canGoNext}
          onClick={() => goToPage(pageNumber + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'z-20 flex shrink-0 items-center justify-center gap-2 border-t border-gray-200 bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        className
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-1 rounded-full px-3"
        disabled={!canGoPrev}
        onClick={() => goToPage(pageNumber - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      <form onSubmit={jumpToPage} className="flex items-center gap-1.5">
        <Input
          type="text"
          inputMode="numeric"
          value={pageInputValue}
          onChange={(e) => setPageInputValue(e.target.value)}
          className="h-10 w-14 text-center"
          aria-label="Número da página"
        />
        <span className="whitespace-nowrap text-sm text-gray-500">de {total}</span>
      </form>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-1 rounded-full px-3"
        disabled={!canGoNext}
        onClick={() => goToPage(pageNumber + 1)}
        aria-label="Próxima página"
      >
        <span className="hidden sm:inline">Próxima</span>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default PdfNavigation;
