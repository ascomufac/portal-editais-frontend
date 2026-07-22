import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PdfNavigationProps {
  numPages: number | null;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
  pageInputValue: string;
  setPageInputValue: (value: string) => void;
  scrollToPage: (pageNum: number) => void;
}

const PdfNavigation: React.FC<PdfNavigationProps> = ({
  numPages,
  pageNumber,
  setPageNumber,
  pageInputValue,
  setPageInputValue,
  scrollToPage
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
        title: "Número de página inválido",
        description: `Digite um número entre 1 e ${numPages}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 p-2 border-t bg-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        disabled={!canGoPrev}
        onClick={() => goToPage(pageNumber - 1)}
        aria-label="Página anterior"
        title="Página anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <form onSubmit={jumpToPage} className="flex items-center">
        <Input
          type="text"
          value={pageInputValue}
          onChange={(e) => setPageInputValue(e.target.value)}
          className="w-14 text-center h-9"
          aria-label="Número da página"
        />
        <span className="mx-2 text-sm text-gray-500 whitespace-nowrap">
          de {total}
        </span>
      </form>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        disabled={!canGoNext}
        onClick={() => goToPage(pageNumber + 1)}
        aria-label="Próxima página"
        title="Próxima página"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default PdfNavigation;
