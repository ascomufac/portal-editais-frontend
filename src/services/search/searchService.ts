
import { SearchResult, SearchSection, sectionPathMap } from './types';
import { mockResults } from './mockData';
import { extractFileNameFromUrl } from './utils';

// URL base da API da UFAC
const BASE_URL = 'https://www3.ufac.br/++api++';

/**
 * Função para buscar documentos na API da UFAC
 * @param {string} query - Termo de busca inserido pelo usuário
 * @param {SearchSection} section - Seção específica para filtrar resultados (padrão: 'all')
 * @returns {Promise<{items: SearchResult[], total: number}>} Resultados da busca e contagem total
 */
export const searchDocuments = async (query: string, section: SearchSection = 'all'): Promise<{ items: SearchResult[]; total: number }> => {
  if (!query || query.length < 3) {
    return { items: [], total: 0 };
  }

  try {
    // Construir a URL de busca com os parâmetros
    const searchParams = new URLSearchParams();
    searchParams.append('SearchableText', query);
    
    // Adicionar parâmetros adicionais para a busca
    searchParams.append('sort_on', 'created');
    searchParams.append('sort_order', 'descending');
    searchParams.append('metadata_fields', 'created');
    searchParams.append('metadata_fields', 'modified');
    searchParams.append('metadata_fields', 'Creator');
    searchParams.append('metadata_fields', 'effective');
    
    // Determinar o caminho da API com base na seção selecionada
    let apiPath = '';
    
    if (section !== 'all' && sectionPathMap[section]) {
      apiPath = `/${sectionPathMap[section]}`;
    }
    
    const apiUrl = `${BASE_URL}${apiPath}/@search?${searchParams.toString()}`;
    console.log(`Realizando busca na API: ${apiUrl}`);
    
    // Realizar a chamada à API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Resultados da API:', data);
    
    // Verificar se há itens nos resultados
    if (!data.items || !Array.isArray(data.items)) {
      console.warn('Resposta da API não contém itens esperados');
      return { items: [], total: 0 };
    }
    
    // Transformar os resultados da API para o formato esperado pelo frontend
    const results: SearchResult[] = data.items.map((item: any, index: number) => {
      // Extrair a seção do item (com base no caminho)
      const itemPath = item['@id'] || '';
      let itemSection: SearchSection = 'all';
      
      // Mapear o caminho da URL para a seção correspondente
      Object.entries(sectionPathMap).forEach(([section, path]) => {
        if (itemPath.includes(`/${path}`)) {
          itemSection = section as SearchSection;
        }
      });
      
      return {
        id: `result-${index}-${Date.now()}`,
        title: item.title || extractFileNameFromUrl(item['@id']),
        description: item.description || '',
        url: item['@id'],
        section: itemSection,
        date: item.created || item.modified || '',
        type: item['@type'] || 'Document'
      };
    });
    
    return {
      items: results,
      total: data.items_total || results.length
    };
    
  } catch (error) {
    console.error('Erro ao buscar na API:', error);
    
    // Em caso de erro, usar dados mockados (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.warn('Utilizando dados mockados devido a erro na API');
      
      // Filtra itens com base na seção
      let results = mockResults.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(query.toLowerCase()));
        
        if (section === 'all') {
          return matchesQuery;
        } else {
          return matchesQuery && item.section === section;
        }
      });

      return {
        items: results,
        total: results.length
      };
    }
    
    return { items: [], total: 0 };
  }
};
