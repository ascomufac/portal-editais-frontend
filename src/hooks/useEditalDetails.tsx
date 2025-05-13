
import { useToast } from '@/components/ui/use-toast';
import { EditalDocumentType, EditalType } from '@/types/edital';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://www3.ufac.br/++api++';



export function useEditalDetails(editalId: string | undefined) {
  const { pathname } = useLocation();
  const [edital, setEdital] = useState<EditalType | null>(null);
  const [documents, setDocuments] = useState<EditalDocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<Array<{id: string, title: string}>>([]);
  const { toast } = useToast();

  // Fetch breadcrumbs from API
  const fetchBreadcrumbs = async (path: string) => {
    try {
      // Normalize the path by removing any "https://www3.ufac.br/" prefix
      const normalizedPath = path.replace(/^\/+|\/+$/g, '').replace('https://www3.ufac.br/', '');
      
      const endpoint = `${BASE_URL}/${normalizedPath}/@breadcrumbs`;
      console.log(`Fetching breadcrumbs from: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        console.warn(`Breadcrumbs API error: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      // The expected format is { items: Array<{@id: string, title: string}> }
      if (data && Array.isArray(data.items)) {
        return data.items.map(item => ({
          id: item['@id'] || '',
          title: item.title || '',
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching breadcrumbs:', error);
      return [];
    }
  };

  // useEffect(() => {
  //   if (!editalId) {
  //     setIsLoading(false);
  //     setError(new Error('Edital ID is required'));
  //     return;
  //   }

  //   setIsLoading(true);
  //   setTimeout(() => {
  //     try {
  //       // Normalize the edital ID by removing leading and trailing slashes
  //       const normalizedId = editalId.replace(/^\/+|\/+$/g, '');
  //       console.log('Looking for edital with ID:', normalizedId);
        
  //       // Try to find the edital in the mock data

  //       if (data) {
  //         // setEdital(data.edital);
  //         // setDocuments(data.documents);
  //         // setCurrentPath([]);
  //         // setCurrentFolder(null);
  //         // setBreadcrumbItems([]);
  //         // setError(null);
          
  //         // Try to fetch real breadcrumbs
  //         fetchBreadcrumbs(normalizedId)
  //           .then(breadcrumbs => {
  //             if (breadcrumbs.length > 0) {
  //               setBreadcrumbItems(breadcrumbs);
  //             }
  //           });
          
  //         toast({
  //           title: "Edital carregado",
  //           description: `${data.documents.length} itens encontrados`,
  //           duration: 3000,
  //         });
  //       } else {
  //         console.error(`No mock data found for editalId: ${normalizedId}`);
  //         setError(new Error('Edital não encontrado'));
  //         setEdital(null);
  //         setDocuments([]);
  //       }
  //     } catch (err) {
  //       console.error('Error processing mock data:', err);
  //       setError(err instanceof Error ? err : new Error('Ocorreu um erro desconhecido'));
  //       setEdital(null);
  //       setDocuments([]);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, 800);
  // }, [editalId, toast]);

  const fetchData = async (_editalId: string) => {
    if (!_editalId) return;
    
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      const filterType = 'All';
      if (filterType !== 'All') {
        searchParams.append('portal_type', filterType);
      }

      const start = 0;
      const limit = 100;
      const sortOrder = 'created';
      const sortDirection = 'descending';

      searchParams.append('b_start', `${start}`);
      searchParams.append('b_size', `${limit}`);
      searchParams.append('sort_on', sortOrder);
      searchParams.append('sort_order', sortDirection);
      searchParams.append('metadata_fields:list', 'item_count');
      searchParams.append('metadata_fields', 'created');
      searchParams.append('metadata_fields', 'modified');
      searchParams.append('metadata_fields', 'Creator');
      searchParams.append('metadata_fields', 'effective');
      searchParams.append('metadata_fields', 'items_total');

      // Normalize the path by removing any "https://www3.ufac.br/" prefix
      const normalizedEditalId = _editalId.replace('https://www3.ufac.br/', '');
      
      const endpoint = `${BASE_URL}/${normalizedEditalId}?${searchParams.toString()}`;
      console.log(`Fetching data from: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setEdital({
        id: data.id || data.UID || '',
        title: data.title || '',
        description: data.description || '',
        color: 'bg-blue-50',
        icon: <FileText className="h-8 w-8 text-blue-600" />,
        href: data['@id'] || '',
        modified: data.modified || '',
        effective: data.effective || '',
        author: data.Creator || data.creators?.[0] || '',
        section: pathname.split('/')[1] || ''
      });
      
      if (data.items && Array.isArray(data.items)) {
        const processedItems = data.items.map((item: any) => ({
          id: item.id || item.UID || item['@id'] || '',
          '@id': item['@id'] || '',
          '@type': item['@type'] || '',
          title: item.title || '',
          description: item.description || '',
          author: item.Creator || item.author || '',
          Creator: item.Creator || item.author || '',
          type: item['@type'] || 'Document',
          lastModified: item.modified || '',
          modified: item.modified || '',
          created: item.created || '',
          effective: item.effective || '',
          url: item['@id'] || '',
          isFolder: item['@type'] === 'Folder' || item.is_folderish,
          parentId: currentFolder || null
        }));
        
        setDocuments(processedItems);
        console.log('Processed items:', processedItems);
      } else {
        console.warn('No items found in API response');
        setDocuments([]);
      }
      
      // Fetch breadcrumbs for this path
      fetchBreadcrumbs(normalizedEditalId)
        .then(breadcrumbs => {
          if (breadcrumbs.length > 0) {
            setBreadcrumbItems(breadcrumbs);
          }
        });
      
      toast({
        title: "Documentos carregados",
        description: `${data.items?.length || 0} itens encontrados`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      
      try {
        // If API fetch fails, try to use mock data
        console.log('Attempting to use mock data for:', _editalId);
        
        // Extract the path components to match with mock data
        const pathParts = _editalId.split('/');
        const mockDataKey = _editalId;
        
        // If there's a folder path, try to find the corresponding mock data
        // const rootEditalId = editalId?.replace(/^\/+|\/+$/g, '') || '';
        
        // let mockData: EditalDocumentType[] = [];
        
        // if (rootEdital) {
        //   if (_editalId === rootEditalId) {
        //     mockData = rootEdital.documents;
        //   } else {
        //     // For navigation within the mock data structure
        //     const lastPart = pathParts[pathParts.length - 1];
            
        //     const findFolder = (docs: EditalDocumentType[], folderId: string): EditalDocumentType[] | null => {
        //       for (const doc of docs) {
        //         if (doc.isFolder && doc.id === folderId) {
        //           return doc.children || [];
        //         }
        //         if (doc.isFolder && doc.children) {
        //           const found = findFolder(doc.children, folderId);
        //           if (found) return found;
        //         }
        //       }
        //       return null;
        //     };
            
        //     mockData = findFolder(rootEdital.documents, lastPart) || [];
        //   }
          
        //   setDocuments(mockData);
          
        //   toast({
        //     title: "Conteúdo da pasta carregado",
        //     description: `${mockData.length} itens encontrados`,
        //     duration: 3000,
        //   });
        // }
      } catch (mockError) {
        console.error('Error using mock data:', mockError);
        setError(mockError instanceof Error ? mockError : new Error('Erro ao carregar os dados'));
        
        toast({
          title: "Erro",
          description: "Não foi possível carregar os documentos. Tente novamente.",
          variant: "destructive",
          duration: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (editalId) {
      fetchData(editalId);
    }
  }, [editalId]);

  const navigateToFolder = async (folderId: string, folderTitle: string) => {
    try {
      setIsLoading(true);
      
      setCurrentFolder(folderId);
      setCurrentPath([...currentPath, folderId]);
      setBreadcrumbItems([...breadcrumbItems, { id: folderId, title: folderTitle }]);
      
      // Try to fetch real data first
      if (folderId.startsWith('http')) {
        try {
          await fetchData(folderId);
          return;
        } catch (error) {
          console.error('Error fetching real folder data:', error);
          // Fall back to mock data
        }
      }
      
      // Use mock data as fallback
      // const rootEditalId = editalId?.replace(/^\/+|\/+$/g, '') || '';
      // const rootEdital = mockEditalDetails[rootEditalId];
      
      // if (rootEdital) {
      //   const findFolder = (docs: EditalDocumentType[], targetId: string): EditalDocumentType[] | null => {
      //     for (const doc of docs) {
      //       if ((doc.isFolder || doc['@type'] === 'Folder') && 
      //           (doc.id === targetId || doc.url === targetId || doc['@id'] === targetId)) {
      //         return doc.children || [];
      //       }
      //       if ((doc.isFolder || doc['@type'] === 'Folder') && doc.children) {
      //         const found = findFolder(doc.children, targetId);
      //         if (found) return found;
      //       }
      //     }
      //     return null;
      //   };
        
      //   const folderContents = findFolder(rootEdital.documents, folderId) || [];
      //   setDocuments(folderContents);
        
      //   // Try to fetch real breadcrumbs
      //   if (folderId.includes('https://www3.ufac.br/')) {
      //     fetchBreadcrumbs(folderId.replace('https://www3.ufac.br/', ''))
      //       .then(breadcrumbs => {
      //         if (breadcrumbs.length > 0) {
      //           setBreadcrumbItems(breadcrumbs);
      //         }
      //       });
      //   }
        
      //   toast({
      //     title: "Pasta aberta",
      //     description: `${folderContents.length} itens encontrados`,
      //     duration: 3000,
      //   });
      // }
      
      console.log(`Navigated to folder: ${folderTitle} (${folderId})`);
    } catch (error) {
      console.error('Error navigating to folder:', error);
      toast({
        title: "Erro na navegação",
        description: "Não foi possível acessar esta pasta. Tente novamente.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateUp = async () => {
    if (currentPath.length > 0) {
      try {
        setIsLoading(true);
        
        const newPath = [...currentPath];
        newPath.pop();
        const newBreadcrumbs = [...breadcrumbItems];
        newBreadcrumbs.pop();
        
        setCurrentPath(newPath);
        setBreadcrumbItems(newBreadcrumbs);
        
        const newCurrentFolder = newPath.length > 0 ? newPath[newPath.length - 1] : null;
        setCurrentFolder(newCurrentFolder);
        
        // Try to navigate using real API data if we have a breadcrumb to go to
        if (breadcrumbItems.length > 1) {
          const previousItem = breadcrumbItems[breadcrumbItems.length - 2];
          try {
            await fetchData(previousItem.id);
            return;
          } catch (error) {
            console.error('Error fetching previous breadcrumb data:', error);
            // Fall back to mock data
          }
        }
        
        // Use mock data as fallback
        const rootEditalId = editalId?.replace(/^\/+|\/+$/g, '') || '';
        // const rootEdital = mockEditalDetails[rootEditalId];
        
        // if (rootEdital) {
        //   if (newPath.length === 0) {
        //     setDocuments(rootEdital.documents);
        //   } else {
        //     const findFolder = (docs: EditalDocumentType[], path: string[]): EditalDocumentType[] | null => {
        //       if (path.length === 0) return docs;
              
        //       const currentId = path[0];
        //       for (const doc of docs) {
        //         if ((doc.isFolder || doc['@type'] === 'Folder') && 
        //             (doc.id === currentId || doc.url === currentId || doc['@id'] === currentId)) {
        //           if (path.length === 1) {
        //             return doc.children || [];
        //           } else {
        //             return findFolder(doc.children || [], path.slice(1));
        //           }
        //         }
        //       }
        //       return null;
        //     };
            
        //     const folderContents = findFolder(rootEdital.documents, newPath) || [];
        //     setDocuments(folderContents);
        //   }
        // }
        
        console.log('Navigated up a level');
      } catch (error) {
        console.error('Error navigating up:', error);
        toast({
          title: "Erro na navegação",
          description: "Não foi possível retornar ao nível anterior. Tente novamente.",
          variant: "destructive",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const navigateToSpecificBreadcrumb = async (stepsBack: number) => {
    try {
      setIsLoading(true);
      
      if (stepsBack <= 0 || stepsBack >= breadcrumbItems.length) {
        console.warn(`Invalid steps back: ${stepsBack}`);
        return;
      }
      
      const targetIndex = breadcrumbItems.length - 1 - stepsBack;
      const targetBreadcrumb = breadcrumbItems[targetIndex];
      
      // Try to fetch data for the target breadcrumb
      try {
        await fetchData(targetBreadcrumb.id);
        
        // Update current path and breadcrumbs
        setCurrentPath(currentPath.slice(0, currentPath.length - stepsBack));
        setBreadcrumbItems(breadcrumbItems.slice(0, targetIndex + 1));
        setCurrentFolder(targetIndex > 0 ? breadcrumbItems[targetIndex].id : null);
        
        return;
      } catch (error) {
        console.error('Error fetching breadcrumb data:', error);
        // Fall back to basic navigation
        for (let i = 0; i < stepsBack; i++) {
          await navigateUp();
        }
      }
    } catch (error) {
      console.error('Error navigating to specific breadcrumb:', error);
      toast({
        title: "Erro na navegação",
        description: "Não foi possível navegar para o local selecionado. Tente novamente.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentFolderContents = (): EditalDocumentType[] => {
    return documents;
  };

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
    getCurrentFolderContents
  };
}
