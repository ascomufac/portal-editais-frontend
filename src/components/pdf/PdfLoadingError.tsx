import React from 'react';
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { getFilenameFromUrl, isPloneUrl, getPloneApiUrl, isPloneJsonResponse, getPdfUrl } from './utils/pdfUtils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PdfLoadingErrorProps {
  loading: boolean;
  error: boolean;
  fileUrl: string;
}

const PdfLoadingError: React.FC<PdfLoadingErrorProps> = ({ loading, error, fileUrl }) => {
  const [directUrl, setDirectUrl] = React.useState<string>(fileUrl);
  
  React.useEffect(() => {
    const processUrl = async () => {
      try {
        if (isPloneJsonResponse(fileUrl)) {
          const pdfUrl = await getPdfUrl(fileUrl);
          if (pdfUrl) {
            setDirectUrl(pdfUrl);
          }
        } 
        else if (isPloneUrl(fileUrl)) {
          setDirectUrl(getPloneApiUrl(fileUrl));
        }
        else {
          setDirectUrl(fileUrl);
        }
      } catch (e) {
        console.error("Error processing URL in error component:", e);
        setDirectUrl(fileUrl);
      }
    };
    
    processUrl();
  }, [fileUrl]);

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isPloneUrl(directUrl) || isPloneJsonResponse(directUrl)) {
      e.preventDefault();
      
      console.log('Opening document from:', directUrl);
      
      window.open(directUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
        <Loader2 className="h-8 w-8 animate-spin text-ufac-blue mb-2" />
        <p className="text-gray-500">Carregando documento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 w-full">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar o documento</AlertTitle>
          <AlertDescription>
            Não foi possível visualizar este PDF. Tente visualizá-lo ou baixá-lo diretamente.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-3">
          <a
            href={directUrl}
            download 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleDownload}
            className="px-4 py-2 bg-ufac-blue text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar documento
          </a>
          
          <a
            href={directUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 border border-ufac-blue text-ufac-blue rounded hover:bg-gray-100 flex items-center"
          >
            Abrir em nova aba
          </a>
        </div>
      </div>
    );
  }

  return null;
};

export default PdfLoadingError;
