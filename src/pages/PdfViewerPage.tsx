
import React, { useEffect, useState } from 'react';
import PdfViewer from '@/components/pdf/PdfViewer';
import MainLayout from '@/layouts/MainLayout';
import { cn, getSidebarCollapsedState } from '@/lib/utils';
import { useParams } from 'react-router-dom';
import { isPloneUrl, isPloneJsonResponse, extractDownloadUrlFromJson } from '@/components/pdf/utils/pdfUtils';
import { useToast } from '@/components/ui/use-toast';

/**
 * Página de visualização de PDF
 * @returns {JSX.Element} Componente React renderizado
 */
const PdfViewerPage: React.FC = () => {
  const { pdfUrl } = useParams<{ pdfUrl: string }>();
  const [jsonResponseData, setJsonResponseData] = useState<any>(null);
  const isSidebarCollapsed = getSidebarCollapsedState();
  const { toast } = useToast();
  
  // Decodifica a URL do PDF (que está codificada na rota)
  const decodedUrl = pdfUrl ? decodeURIComponent(pdfUrl) : '';
  
  // Para respostas JSON, busca os dados
  useEffect(() => {
    const checkJsonResponse = async () => {
      if (decodedUrl && isPloneJsonResponse(decodedUrl)) {
        try {
          // Tenta buscar como JSON primeiro
          const response = await fetch(decodedUrl);
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setJsonResponseData(data);
            
            // Mostra toast com informações do arquivo do JSON
            if (data.title && data.file) {
              toast({
                title: "Documento do Plone carregado",
                description: `${data.title} (${(data.file.size / 1024).toFixed(1)} KB)`,
                duration: 3000,
              });
            }
          }
        } catch (error) {
          console.error('Erro ao buscar JSON:', error);
        }
      }
    };
    
    checkJsonResponse();
  }, [decodedUrl, toast]);
  
  // Para URLs do Plone, mostraremos informações adicionais
  useEffect(() => {
    if (decodedUrl && (isPloneUrl(decodedUrl) || jsonResponseData)) {
      // Se for uma URL do Plone, informa ao usuário que estamos tratando-a especialmente
      toast({
        title: "Documento do sistema Plone",
        description: "Este documento pode ser aberto diretamente do sistema Plone.",
        duration: 5000,
      });
      
      // Adiciona uma meta tag para ajudar os navegadores a reconhecer o tipo de conteúdo
      const metaTag = document.createElement('meta');
      metaTag.httpEquiv = 'Content-Type';
      metaTag.content = 'application/pdf';
      document.head.appendChild(metaTag);
      
      return () => {
        document.head.removeChild(metaTag);
      };
    }
  }, [decodedUrl, jsonResponseData, toast]);

  // Obtém a URL do arquivo - da resposta JSON ou do parâmetro de URL
  const fileUrl = jsonResponseData?.targetUrl || 
                 (jsonResponseData?.file?.download) || 
                 decodedUrl;

  return (
    <MainLayout pageTitle="Visualizador de PDF" className='p-0 overflow-hidden' >
      <div className={cn("h-[calc(100vh-4rem)] relative z-30 w-full",
        isSidebarCollapsed ? 'max-w-[calc(100vw-64px)]' : 'max-w-[calc(100vw-320px)]')}>
         
        {fileUrl ? (
          <PdfViewer 
            fileUrl={fileUrl} 
            fileName={jsonResponseData?.title || undefined}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">URL do PDF não encontrada.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PdfViewerPage;
