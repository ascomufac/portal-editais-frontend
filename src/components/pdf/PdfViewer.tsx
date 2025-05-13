
import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { PdfViewerProvider } from './context/PdfViewerContext';
import PdfViewerLayout from './layout/PdfViewerLayout';
import PdfContent from './PdfContent';
import PdfLoadingError from './PdfLoadingError';
import { isPloneUrl, getPdfUrl, isPloneJsonResponse } from './utils/pdfUtils';
import { useToast } from '@/components/ui/use-toast';

// Configuração necessária para react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Interface para as propriedades do componente PdfViewer
 * @interface PdfViewerProps
 * @property {string} fileUrl - URL do arquivo PDF a ser exibido
 * @property {string} [fileName] - Nome do arquivo para exibição
 */
interface PdfViewerProps {
  fileUrl: string;
  fileName?: string;
}

/**
 * Componente principal para visualização de PDFs
 * @param {PdfViewerProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 * @description Gerencia o carregamento, processamento e exibição de documentos PDF,
 *              incluindo tratamento para URLs do Plone e respostas JSON.
 */
const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl, fileName }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string>(fileUrl);
  const { toast } = useToast();

  useEffect(() => {
    // Reseta estados quando a URL muda
    setLoading(true);
    setError(null);
    
    /**
     * Processa a URL do PDF antes da exibição
     * @description Analisa e processa URLs, incluindo respostas JSON do Plone
     */
    const processUrl = async () => {
      try {
        console.log('Processando URL:', fileUrl);
        
        // Verifica se é um objeto JSON passado como string
        if (typeof fileUrl === 'string' && (fileUrl.startsWith('{') || fileUrl.startsWith('['))) {
          try {
            console.log('Tentando analisar string JSON:', fileUrl.substring(0, 100) + '...');
            const jsonData = JSON.parse(fileUrl);
            
            // Extrai a URL do PDF do JSON
            const pdfUrl = await getPdfUrl(jsonData);
            if (pdfUrl) {
              setProcessedUrl(pdfUrl);
              console.log('URL do PDF extraída da string JSON:', pdfUrl);
            } else {
              throw new Error('Não foi possível obter o URL do documento do JSON');
            }
          } catch (jsonError) {
            console.error('Erro ao analisar string JSON:', jsonError);
            setError(jsonError as Error);
          }
        }
        // Verifica se pode ser uma URL de resposta JSON do Plone
        else if (isPloneJsonResponse(fileUrl)) {
          toast({
            title: "Processando documento",
            description: "Obtendo informações do documento do sistema Plone...",
            duration: 3000,
          });
          
          try {
            // Obtém a URL de download direta
            const pdfUrl = await getPdfUrl(fileUrl);
            if (pdfUrl) {
              setProcessedUrl(pdfUrl);
              console.log('URL processada do JSON:', pdfUrl);
            } else {
              throw new Error('Não foi possível obter o URL do documento');
            }
          } catch (jsonError) {
            console.error('Erro ao processar resposta JSON:', jsonError);
            setError(jsonError as Error);
          }
        } else {
          // Processamento normal de URL de PDF
          setProcessedUrl(fileUrl);
        }
        
        // Para URLs do Plone, mostra uma notificação sobre download direto
        if (isPloneUrl(fileUrl)) {
          toast({
            title: "Documento do Plone",
            description: "Este documento será aberto diretamente da fonte. Se tiver problemas de visualização, use o botão 'Abrir em nova aba'.",
            duration: 5000,
          });
        }
      } catch (e) {
        console.error('Erro ao processar URL:', e);
        setError(e as Error);
      } finally {
        // Pequeno atraso para deixar a UI atualizar
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };
    
    processUrl();
    
  }, [fileUrl, toast]);

  // Mostra estados de carregamento ou erro
  if (loading || error) {
    return <PdfLoadingError loading={loading} error={!!error} fileUrl={fileUrl} />;
  }

  return (
    <PdfViewerProvider fileUrl={processedUrl}>
      <PdfViewerLayout fileName={fileName}>
        <PdfContent />
      </PdfViewerLayout>
    </PdfViewerProvider>
  );
};

export default PdfViewer;
