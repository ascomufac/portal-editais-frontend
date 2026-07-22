import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PdfToolbarProps {
  displayFileName: string;
  fileUrl: string;
  searchComponent: React.ReactNode;
  thumbnailToggle?: React.ReactNode;
  /** No desktop, zoom/nav ficam no footer — busca permanece aqui */
  compact?: boolean;
  /**
   * full: voltar + nome + tools + baixar (página pública)
   * tools: só miniaturas + busca (quando o shell pai já tem chrome)
   */
  variant?: 'full' | 'tools';
}

/**
 * Toolbar superior: voltar, nome, miniaturas, busca (desktop) e download.
 * Zoom e páginas ficam no PdfFooter.
 */
const PdfToolbar: React.FC<PdfToolbarProps> = ({
  displayFileName,
  fileUrl,
  searchComponent,
  thumbnailToggle,
  variant = 'full',
}) => {
  const navigate = useNavigate();

  if (variant === 'tools') {
    if (!thumbnailToggle && !searchComponent) return null;
    return (
      <div className="z-10 flex w-full shrink-0 border-b border-gray-100 bg-white px-2 py-1.5 sm:px-3">
        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
          {thumbnailToggle}
          {searchComponent}
        </div>
      </div>
    );
  }

  return (
    <div className="z-10 flex w-full shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-2 sm:px-4">
      <div className="flex w-full items-center gap-2">
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
            className="min-w-0 flex-1 truncate text-xs font-medium text-gray-500 sm:max-w-[240px] sm:text-sm lg:max-w-[320px]"
            title={displayFileName}
          >
            {displayFileName}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {thumbnailToggle}

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
