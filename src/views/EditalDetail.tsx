'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useEditalDetails } from '@/hooks/useEditalDetails';
import MainLayout from '@/layouts/MainLayout';
import EditalFolderNavigator from '@/components/edital/EditalFolderNavigator';
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
  const pathname = usePathname();
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

  const publishedLabel = useMemo(
    () =>
      edital?.effective ? `Publicado em ${formatDate(edital.effective)}` : null,
    [edital?.effective]
  );
  const updatedLabel = useMemo(
    () =>
      edital?.modified && edital.modified !== edital.effective
        ? `Atualizado em ${formatDate(edital.modified)}`
        : null,
    [edital?.modified, edital?.effective]
  );

  return (
    <MainLayout
      pageTitle={edital?.title || 'Carregando...'}
      className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-5xl">
        {isLoading && !edital ? (
          <EditalTitleSkeleton />
        ) : error ? (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700 sm:p-6">
            <h3 className="mb-1 font-semibold">Não foi possível carregar o conteúdo</h3>
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
            header={
              edital
                ? {
                    title: edital.title,
                    description: edital.description,
                    htmlContent: edital.htmlContent,
                    portalType: edital['@type'],
                    isFolderish: Boolean(edital.is_folderish),
                    favoriteId: edital.href || pathname,
                    favoriteHref: pathname,
                    publishedLabel,
                    updatedLabel,
                  }
                : undefined
            }
          />
        )}
      </div>
    </MainLayout>
  );
};

export default EditalDetail;
