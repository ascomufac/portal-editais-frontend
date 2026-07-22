import { useToast } from '@/components/ui/use-toast';
import { EditalDocumentType, EditalType } from '@/types/edital';
import { apiFetch } from '@/services/apiClient';
import {
  SITE_URL,
  rewritePloneHtmlLinks,
  toEditalHref,
  toSitePath,
} from '@/services/editalService';
import { FileText } from 'lucide-react';
import { createElement, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useEditalDetails(editalId: string | undefined) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [edital, setEdital] = useState<EditalType | null>(null);
  const [documents, setDocuments] = useState<EditalDocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<Array<{ id: string; title: string }>>(
    []
  );
  const { toast } = useToast();

  const fetchBreadcrumbs = async (path: string) => {
    try {
      const normalizedPath = path.replace(/^\/+|\/+$/g, '').replace(`${SITE_URL}/`, '');
      const endpoint = `/${normalizedPath}/@breadcrumbs`;
      const response = await apiFetch(endpoint);

      if (!response.ok) {
        console.warn(`Breadcrumbs API error: ${response.status}`);
        return [];
      }

      const data = await response.json();

      if (data && Array.isArray(data.items)) {
        return data.items.map((item: { '@id'?: string; title?: string }) => ({
          id: item['@id'] || '',
          title: item.title || '',
        }));
      }

      return [];
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
      const searchParams = new URLSearchParams();
      searchParams.append('b_start', '0');
      searchParams.append('b_size', '100');
      searchParams.append('sort_on', 'modified');
      searchParams.append('sort_order', 'descending');
      searchParams.append('metadata_fields:list', 'item_count');
      searchParams.append('metadata_fields', 'created');
      searchParams.append('metadata_fields', 'modified');
      searchParams.append('metadata_fields', 'Creator');
      searchParams.append('metadata_fields', 'effective');
      searchParams.append('metadata_fields', 'items_total');

      const normalizedEditalId = toSitePath(_editalId);
      const endpoint = `/${normalizedEditalId}?${searchParams.toString()}`;
      const response = await apiFetch(endpoint);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Links do Plone: seguir remoteUrl interno
      if (data['@type'] === 'Link' && data.remoteUrl) {
        if (String(data.remoteUrl).includes('www3.ufac.br')) {
          const target = toEditalHref(data.remoteUrl);
          navigate(target, { replace: true });
          return;
        }
        window.location.href = data.remoteUrl;
        return;
      }

      const rawHtml =
        typeof data.text === 'object' && data.text?.data
          ? String(data.text.data)
          : typeof data.text === 'string'
            ? data.text
            : '';

      setEdital({
        id: data.id || data.UID || '',
        title: data.title || '',
        description: data.description || '',
        color: 'bg-blue-50',
        icon: createElement(FileText, { className: 'h-8 w-8 text-blue-600' }),
        href: data['@id'] || '',
        modified: data.modified || '',
        effective: data.effective || '',
        author: data.Creator || data.creators?.[0] || '',
        section: pathname.split('/')[1] || '',
        '@type': data['@type'],
        is_folderish: data.is_folderish,
        items_total: data.items_total,
        htmlContent: rawHtml ? rewritePloneHtmlLinks(rawHtml) : undefined,
      });

      if (data.items && Array.isArray(data.items)) {
        const processedItems = data.items.map(
          (item: Record<string, unknown> & { '@id'?: string; '@type'?: string }) => ({
            id: String(item.id || item.UID || item['@id'] || ''),
            '@id': item['@id'] || '',
            '@type': item['@type'] || '',
            title: String(item.title || ''),
            description: String(item.description || ''),
            author: String(item.Creator || item.author || ''),
            Creator: String(item.Creator || item.author || ''),
            type: String(item['@type'] || 'Document'),
            lastModified: String(item.modified || ''),
            modified: String(item.modified || ''),
            created: String(item.created || ''),
            effective: String(item.effective || ''),
            url: String(item['@id'] || ''),
            isFolder:
              item['@type'] === 'Folder' ||
              item['@type'] === 'Collection' ||
              Boolean(item.is_folderish),
            parentId: folderParent,
          })
        );

        setDocuments(processedItems);
      } else {
        setDocuments([]);
      }

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
      navigate(toEditalHref(path));
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
        navigate(toEditalHref(path));
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
          navigate(toEditalHref(parent));
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

      navigate(toEditalHref(path));
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
