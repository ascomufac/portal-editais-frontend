
import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useEditalDetails } from '@/hooks/useEditalDetails';
import MainLayout from '@/layouts/MainLayout';
import EditalFolderNavigator from '@/components/edital/EditalFolderNavigator';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, FileText, UserCircle } from 'lucide-react';
import EditalTitleSkeleton from '@/components/edital/EditalTitleSkeleton';
import { formatDate } from '@/lib/utils';

const EditalDetail: React.FC = () => {
  const { pathname } = useLocation();
  const { editalId, setor } = useParams<{ editalId: string, setor: string }>();
  
  // Combine setor and editalId for proper path handling
  const fullEditalPath = setor && editalId 
    ? `${setor}/${decodeURIComponent(editalId)}`
    : editalId ? decodeURIComponent(editalId) 
    : undefined;
  
  const {
    edital,
    documents,
    isLoading,
    error,
    currentFolder,
    breadcrumbItems,
    navigateToFolder,
    navigateUp,
    navigateToSpecificBreadcrumb,
    getCurrentFolderContents
  } = useEditalDetails(fullEditalPath);

  useEffect(() => {
    if (edital) {
      document.title = `${edital.title} | UFAC Editais`;
    }
  }, [edital]);

  return (
    <MainLayout pageTitle={edital?.title || 'Carregando...'}>
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <EditalTitleSkeleton />
        ) : edital ? (
          <Card className="mb-8 border-none shadow-none bg-white">
            <CardContent className="p-6 pt-6">
              <div className="flex items-center mb-4">
                <div className={`h-14 w-14 rounded-full flex items-center justify-center ${edital.color || 'bg-blue-50'} mr-4`}>
                  {edital.icon || <FileText className="h-8 w-8 text-blue-600" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{edital.title}</h1>
                  {edital.description && <p className="text-gray-600">{edital.description}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {edital.effective && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Publicado em</p>
                      <p className="font-medium">{formatDate(edital.effective)}</p>
                    </div>
                  </div>
                )}
                
                {edital.modified && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Última modificação</p>
                      <p className="font-medium">{formatDate(edital.modified)}</p>
                    </div>
                  </div>
                )}
                
                {edital.author && (
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Autor</p>
                      <p className="font-medium">{edital.author}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <div className="bg-red-50 p-6 rounded-lg text-red-700 mb-6">
            <h3 className="font-bold text-lg mb-2">Erro ao carregar o edital</h3>
            <p>{error.message}</p>
            <p className="mt-2">Tente novamente mais tarde ou entre em contato com o suporte.</p>
          </div>
        ) : (
          <EditalFolderNavigator
            documents={documents}
            currentFolder={currentFolder}
            breadcrumbItems={breadcrumbItems}
            navigateToFolder={navigateToFolder}
            navigateUp={navigateUp}
            navigateToSpecificBreadcrumb={navigateToSpecificBreadcrumb}
            getCurrentFolderContents={getCurrentFolderContents}
            editalTitle={edital?.title}
            isLoading={isLoading}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default EditalDetail;
