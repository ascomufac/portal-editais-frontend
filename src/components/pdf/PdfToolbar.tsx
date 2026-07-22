import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Minus, Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FitType } from './utils/pdfUtils';

interface PdfToolbarProps {
  displayFileName: string;
  scale: number;
  setScale: (scale: number) => void;
  fitType: FitType;
  setFitType: (type: FitType) => void;
  fileUrl: string;
  searchComponent: React.ReactNode;
  thumbnailToggle?: React.ReactNode;
  /** Prev/next compacto — exibido no mobile */
  pageNavigation?: React.ReactNode;
}

const PdfToolbar: React.FC<PdfToolbarProps> = ({
  displayFileName,
  scale,
  setScale,
  fileUrl,
  searchComponent,
  thumbnailToggle,
  pageNavigation,
}) => {
  const navigate = useNavigate();

  const zoomIn = () => {
    setScale(Math.min(scale + 0.1, 3.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.1));
  };

  return (
    <div className="z-10 flex w-full shrink-0 flex-col gap-1.5 border-b border-gray-200 bg-gray-50 px-2 py-2 sm:gap-2 sm:px-4">
      <div className="flex w-full flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-1 h-9 shrink-0 gap-1 px-2 text-gray-600 hover:text-gray-900"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>

          <span
            className="min-w-0 flex-1 truncate text-xs font-medium text-gray-500 sm:max-w-[200px] sm:text-sm lg:max-w-[280px]"
            title={displayFileName}
          >
            {displayFileName}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {thumbnailToggle}

          {pageNavigation && (
            <div className="sm:hidden">{pageNavigation}</div>
          )}

          <div className="flex items-center rounded-lg border border-gray-200 bg-white px-0.5">
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-full"
              size="icon"
              onClick={zoomOut}
              aria-label="Diminuir zoom"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="min-w-[3rem] text-center text-xs tabular-nums sm:text-sm">
              {Math.round(scale * 100)}%
            </span>

            <Button
              variant="ghost"
              className="h-8 w-8 rounded-full"
              size="icon"
              onClick={zoomIn}
              aria-label="Aumentar zoom"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden sm:block">{searchComponent}</div>

          <Button size="sm" className="h-9 bg-ufac-blue px-2.5 sm:px-3" asChild>
            <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Baixar</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PdfToolbar;
