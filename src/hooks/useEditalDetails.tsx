import { useToast } from '@/components/ui/use-toast';
import { EditalDocumentType, EditalType } from '@/types/edital';
import { apiFetch } from '@/services/apiClient';
import { getAccessToken } from '@/services/authService';
import { SITE_URL, toEditalHref, toSitePath } from '@/services/editalService';
import {
  editalContentQuery,
  normalizeEditalPath,
  parseEditalBreadcrumbs,
  parseEditalContent,
  type EditalBreadcrumb,
  type EditalInfo,
  type EditalPageData,
} from '@/lib/edital-content';
import { FileText, Folder } from 'lucide-react';
import { createElement, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const toEdital = (info: EditalInfo, pathname: string): EditalType => ({
  ...info,
  color: 'bg-blue-50',
  icon: createElement(
    info['@type'] === 'Folder' || info['@type'] === 'Collection' || info.is_folderish
      ? Folder
      : FileText,
    { className: 'h-8 w-8 text-ufac-blue' }
  ),
  section: pathname.split('/')[1] || '',
});

/**
 * @param initial conteúdo já carregado no servidor; usado na primeira renderização
 * quando corresponde ao edital da URL.
 */
export function useEditalDetails(editalId: string | undefined, initial?: EditalPageData) {
  const pathname = usePathname();
  const router = useRouter();
  const initialData =
    initial &&
    !initial.content.remoteUrl &&
    editalId &&
    normalizeEditalPath(editalId) === initial.path
      ? initial
      : undefined;
  const [edital, setEdital] = useState<EditalType | null>(() =>
    initialData ? toEdital(initialData.content.edital, pathname) : null
  );
  const [documents, setDocuments] = useState<EditalDocumentType[]>(
    () => initialData?.content.documents ?? []
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<EditalBreadcrumb[]>(
    () => initialData?.breadcrumbs ?? []
  );
  // Conteúdo do servidor dispensa a primeira busca (exceto logado: pode ver itens privados).
  const skipFirstFetch = useRef(Boolean(initialData));
  const { toast } = useToast();

  const fetchBreadcrumbs = async (path: string): Promise<EditalBreadcrumb[]> => {
    try {
      const normalizedPath = path.replace(/^\/+|\/+$/g, '').replace(`${SITE_URL}/`, '');
      const endpoint = `/${normalizedPath}/@breadcrumbs`;
      const response = await apiFetch(endpoint);

      if (!response.ok) {
        console.warn(`Breadcrumbs API error: ${response.status}`);
        return [];
      }

      return parseEditalBreadcrumbs(await response.json());
    } catch (err) {
      console.error('Error fetching breadcrumbs:', err);
      return [];
    }
  };

  const fetchData = async (_editalId: string, folderParent: string | null = null) => {
    if (!_editalId) return;

    setIsLoading(true);
    setError(null);

    try {
      const normalizedEditalId = toSitePath(_editalId);
      const endpoint = `/${normalizedEditalId}?${editalContentQuery()}`;
      const response = await apiFetch(endpoint);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const content = parseEditalContent(await response.json(), folderParent);

      // Links do Plone: seguir remoteUrl interno
      if (content.remoteUrl) {
        if (content.remoteUrl.includes('www3.ufac.br')) {
          router.replace(toEditalHref(content.remoteUrl));
          return;
        }
        window.location.href = content.remoteUrl;
        return;
      }

      setEdital(toEdital(content.edital, pathname));
      setDocuments(content.documents);

      const breadcrumbs = await fetchBreadcrumbs(normalizedEditalId);
      if (breadcrumbs.length > 0) {
        setBreadcrumbItems(breadcrumbs);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorObj = err instanceof Error ? err : new Error('Erro ao carregar os dados');
      setError(errorObj);
      setDocuments([]);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os documentos. Tente novamente.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      if (!getAccessToken()) return;
    }
    if (editalId) {
      fetchData(editalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editalId]);

  const navigateToFolder = async (folderId: string, folderTitle: string) => {
    try {
      setIsLoading(true);
      setCurrentFolder(folderId);
      setCurrentPath((prev) => [...prev, folderId]);
      setBreadcrumbItems((prev) => [...prev, { id: folderId, title: folderTitle }]);

      const path = folderId.includes('ufac.br') ? toSitePath(folderId) : folderId;
      router.push(toEditalHref(path));
      await fetchData(path, folderId);
    } catch (err) {
      console.error('Error navigating to folder:', err);
      toast({
        title: 'Erro na navegação',
        description: 'Não foi possível acessar esta pasta. Tente novamente.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateUp = async () => {
    if (breadcrumbItems.length <= 1 && !editalId) return;

    try {
      setIsLoading(true);

      if (breadcrumbItems.length > 1) {
        const previousItem = breadcrumbItems[breadcrumbItems.length - 2];
        const path = toSitePath(previousItem.id);
        router.push(toEditalHref(path));
        setCurrentPath((prev) => prev.slice(0, -1));
        setBreadcrumbItems((prev) => prev.slice(0, -1));
        setCurrentFolder(path);
        await fetchData(path);
        return;
      }

      if (editalId) {
        const parts = toSitePath(editalId).split('/');
        if (parts.length > 1) {
          const parent = parts.slice(0, -1).join('/');
          router.push(toEditalHref(parent));
          await fetchData(parent);
        }
      }
    } catch (err) {
      console.error('Error navigating up:', err);
      toast({
        title: 'Erro na navegação',
        description: 'Não foi possível retornar ao nível anterior. Tente novamente.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSpecificBreadcrumb = async (stepsBack: number) => {
    try {
      setIsLoading(true);

      if (stepsBack <= 0 || stepsBack >= breadcrumbItems.length) {
        return;
      }

      const targetIndex = breadcrumbItems.length - 1 - stepsBack;
      const targetBreadcrumb = breadcrumbItems[targetIndex];
      const path = toSitePath(targetBreadcrumb.id);

      router.push(toEditalHref(path));
      await fetchData(path, targetIndex > 0 ? targetBreadcrumb.id : null);
      setCurrentPath((prev) => prev.slice(0, prev.length - stepsBack));
      setBreadcrumbItems((prev) => prev.slice(0, targetIndex + 1));
      setCurrentFolder(targetIndex > 0 ? targetBreadcrumb.id : null);
    } catch (err) {
      console.error('Error navigating to specific breadcrumb:', err);
      toast({
        title: 'Erro na navegação',
        description: 'Não foi possível navegar para o local selecionado. Tente novamente.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentFolderContents = (): EditalDocumentType[] => documents;

  return {
    edital,
    documents,
    isLoading,
    error,
    currentPath,
    currentFolder,
    breadcrumbItems,
    navigateToFolder,
    navigateUp,
    navigateToSpecificBreadcrumb,
    getCurrentFolderContents,
  };
}
