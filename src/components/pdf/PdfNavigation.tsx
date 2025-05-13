
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
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

  const jumpToPage = (event: React.FormEvent) => {
    event.preventDefault();
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && numPages && pageNum <= numPages) {
      setPageNumber(pageNum);
      scrollToPage(pageNum);
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
    <div className="flex items-center justify-center space-x-2 p-1 border-t flex-wrap gap-y-2">


      <form onSubmit={jumpToPage} className="flex items-center">
        <Input
          type="text"
          value={pageInputValue}
          onChange={(e) => setPageInputValue(e.target.value)}
          className="w-16 text-center h-9"
          aria-label="Número da página"
        />
        <span className="mx-2 text-sm text-gray-500">
          de {numPages}
        </span>
      </form>
    </div>
  );
};

export default PdfNavigation;
