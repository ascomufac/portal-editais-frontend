import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEditalDetails } from '@/hooks/useEditalDetails';
import MainLayout from '@/layouts/MainLayout';
import EditalFolderNavigator from '@/components/edital/EditalFolderNavigator';
import { FileText } from 'lucide-react';
import EditalTitleSkeleton from '@/components/edital/EditalTitleSkeleton';
import { formatDate } from '@/lib/utils';

/**
 * Extrai o caminho Plone completo a partir de /edital/...
 * Ex.: /edital/prograd/processo-seletivo-... → prograd/processo-seletivo-...
 */
const getEditalPathFromLocation = (pathname: string): string | undefined => {
  const match = pathname.match(/^\/edital\/(.+)$/);
  if (!match?.[1]) return undefined;
  return decodeURIComponent(match[1].replace(/\/+$/, ''));
};

const EditalDetail: React.FC = () => {
  const { pathname } = useLocation();
  const fullEditalPath = getEditalPathFromLocation(pathname);

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
    getCurrentFolderContents,
  } = useEditalDetails(fullEditalPath);

  useEffect(() => {
    if (edital) {
      document.title = `${edital.title} | UFAC Editais`;
    }
  }, [edital]);

  const metaParts = [
    edital?.effective && formatDate(edital.effective),
    edital?.modified && `Atualizado ${formatDate(edital.modified)}`,
    edital?.author,
  ].filter(Boolean);

  return (
    <MainLayout
      pageTitle={edital?.title || 'Carregando...'}
      className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-6xl">
        {isLoading ? (
          <EditalTitleSkeleton />
        ) : edital ? (
          <header className="mb-4 sm:mb-6">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${edital.color || 'bg-blue-50'}`}
              >
                {edital.icon || <FileText className="h-5 w-5 text-ufac-blue" />}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl sm:font-bold">
                  {edital.title}
                </h1>
                {edital.description && (
                  <p className="mt-1 hidden text-sm text-gray-600 sm:block">
                    {edital.description}
                  </p>
                )}
                {metaParts.length > 0 && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:mt-2 sm:text-sm">
                    {metaParts.join(' · ')}
                  </p>
                )}
              </div>
            </div>

            {edital.htmlContent && (
              <div
                className="prose prose-sm mt-4 max-w-none text-gray-700 sm:mt-6
                  prose-a:text-ufac-blue prose-a:underline
                  prose-headings:text-ufac-blue prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: edital.htmlContent }}
              />
            )}
          </header>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 sm:p-6">
            <h3 className="mb-1 font-semibold">Erro ao carregar o edital</h3>
            <p className="text-sm">{error.message}</p>
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
