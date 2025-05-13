
import { TextItem } from 'pdfjs-dist/types/src/display/api';

/**
 * Verifica se uma URL aponta para um recurso do CMS Plone
 * @param {string} url - A URL a ser verificada
 * @returns {boolean} Verdadeiro se a URL for de um recurso Plone
 */
export const isPloneUrl = (url: string): boolean => {
  return url.includes('ufac.br') && 
    (url.includes('/@@download/') || 
     url.includes('/view') || 
     url.includes('/at_download/') ||
     url.includes('/edital'));
};

/**
 * Verifica se a URL ou objeto fornecido pode ser uma resposta JSON do Plone
 * @param {string | object} urlOrObject - URL ou objeto a ser verificado
 * @returns {boolean} Verdadeiro se o parâmetro for uma possível resposta JSON do Plone
 */
export const isPloneJsonResponse = (urlOrObject: string | object): boolean => {
  if (typeof urlOrObject === 'string') {
    try {
      // Tenta analisar como JSON
      const obj = JSON.parse(urlOrObject);
      return obj && 
        (obj.targetUrl || 
         (obj.file && obj.file.download) || 
         obj['@type'] === 'File');
    } catch (e) {
      // Não é JSON, verifica se é uma URL da API Plone
      return urlOrObject.includes('ufac.br') && 
        (urlOrObject.includes('@id') || 
         urlOrObject.includes('@@API'));
    }
  } else if (typeof urlOrObject === 'object' && urlOrObject !== null) {
    // Verifica se o objeto tem estrutura JSON do Plone
    return 'targetUrl' in urlOrObject || 
      ('file' in urlOrObject && typeof urlOrObject.file === 'object' && 'download' in urlOrObject.file) ||
      '@type' in urlOrObject;
  }
  return false;
};

/**
 * Obtém uma URL de download direta a partir de uma URL da API Plone
 * @param {string} url - URL da API Plone
 * @returns {string} URL de download direta
 */
export const getPloneApiUrl = (url: string): string => {
  if (!url) return '';
  
  // Se já for uma URL de download direta, retorna como está
  if (url.includes('/@@download/') || url.includes('/at_download/')) {
    return url;
  }
  
  // Tenta converter uma URL de visualização para uma URL de download
  if (url.includes('/view')) {
    return url.replace('/view', '/@@download/file');
  }
  
  // Adiciona sufixo de download se for um arquivo sem caminho de download
  if (!url.endsWith('/@@download/file') && !url.includes('/at_download/')) {
    // Verifica se a URL já tem parâmetros
    if (url.includes('?')) {
      return `${url}&download=true`;
    } else {
      return `${url}/@@download/file`;
    }
  }
  
  return url;
};

/**
 * Extrai URL do PDF de uma resposta JSON do Plone
 * @param {string | object} urlOrJson - URL ou objeto JSON do Plone
 * @returns {Promise<string>} URL do PDF extraída
 * @throws {Error} Erro se não for possível extrair a URL do PDF
 */
export const getPdfUrl = async (urlOrJson: string | object): Promise<string> => {
  try {
    let jsonData;
    
    // Analisa JSON se for string, ou usa o objeto diretamente
    if (typeof urlOrJson === 'string') {
      try {
        jsonData = JSON.parse(urlOrJson);
      } catch (e) {
        // Se não for JSON válido, tenta buscar da URL
        const response = await fetch(urlOrJson);
        if (!response.ok) {
          throw new Error(`Falha ao buscar JSON do Plone: ${response.statusText}`);
        }
        jsonData = await response.json();
      }
    } else {
      jsonData = urlOrJson;
    }
    
    // Extrai URL de download da estrutura JSON do Plone
    if (jsonData) {
      // Verifica o campo targetUrl primeiro (primário)
      if (jsonData.targetUrl) {
        console.log('Usando targetUrl do JSON do Plone:', jsonData.targetUrl);
        return jsonData.targetUrl;
      }
      
      // Verifica o campo file.download em segundo lugar
      if (jsonData.file && jsonData.file.download) {
        console.log('Usando file.download do JSON do Plone:', jsonData.file.download);
        return jsonData.file.download;
      }
      
      // Verifica o campo @id como fallback
      if (jsonData['@id']) {
        console.log('Usando @id do JSON do Plone com sufixo de download:', jsonData['@id']);
        return `${jsonData['@id']}/@@download/file`;
      }
    }
    
    throw new Error('Não foi possível extrair URL do PDF da resposta do Plone');
  } catch (error) {
    console.error('Erro ao processar JSON do Plone:', error);
    throw error;
  }
};

/**
 * Extrai o nome do arquivo de uma URL
 * @param {string} url - URL contendo o nome do arquivo
 * @returns {string} Nome do arquivo extraído
 */
export const getFilenameFromUrl = (url: string): string => {
  try {
    if (!url) return 'document.pdf';
    
    // Extrai de padrões de URL do Plone
    if (url.includes('/@@download/')) {
      const parts = url.split('/');
      const fileIndex = parts.findIndex(part => part === '@@download');
      if (fileIndex > 0) {
        return parts[fileIndex - 1];
      }
    }
    
    // Extração padrão da URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return segments[segments.length - 1];
    }
    
    return 'document.pdf';
  } catch (e) {
    return 'document.pdf';
  }
};

/**
 * Tipo de ajuste para exibição do PDF
 * @typedef {'width' | 'height' | 'page'} FitType
 */
export type FitType = 'width' | 'height' | 'page';

/**
 * Obtém o número da página mais visível em um contêiner
 * @param {HTMLDivElement} containerRef - O elemento contêiner
 * @returns {number | null} O número da página mais visível
 */
export const getMostVisiblePage = (containerRef: HTMLDivElement): number | null => {
  if (!containerRef) return null;

  const containerRect = containerRef.getBoundingClientRect();
  const pageElements = containerRef.querySelectorAll('.react-pdf__Page');

  let mostVisiblePage: number | null = null;
  let maxVisibleHeight = 0;

  pageElements.forEach(page => {
    const pageRect = page.getBoundingClientRect();

    // Calcula a interseção da página e do contêiner
    const intersectionHeight = Math.max(
      0,
      Math.min(containerRect.bottom, pageRect.bottom) - Math.max(containerRect.top, pageRect.top)
    );

    // Considera apenas páginas que são pelo menos parcialmente visíveis
    if (intersectionHeight > 0) {
      // Se esta página é mais visível que a página mais visível atual, atualiza
      if (intersectionHeight > maxVisibleHeight) {
        maxVisibleHeight = intersectionHeight;
        mostVisiblePage = parseInt(page.getAttribute('data-page-number') || '0', 10);
      }
    }
  });

  return mostVisiblePage;
};

/**
 * Extrai o contexto de texto ao redor de um termo específico em uma string
 * @param {string} text - O texto para buscar
 * @param {string} searchTerm - O termo para encontrar o contexto
 * @param {number} contextLength - O número de caracteres a incluir antes e depois do termo
 * @returns {string} O contexto extraído
 */
export const extractTextContext = (text: string, searchTerm: string, contextLength: number = 50): string => {
  if (!text || !searchTerm) return '';

  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());

  if (index === -1) return '';

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + searchTerm.length + contextLength);

  return text.substring(start, end);
};

/**
 * Extrai URL de download de uma resposta JSON do Plone
 * @param {any} json - Resposta JSON da API Plone
 * @returns {string | null} A URL de download do PDF
 */
export const extractDownloadUrlFromJson = (json: any): string | null => {
  if (!json) return null;
  
  // Verifica URL de download direta no campo targetUrl
  if (json.targetUrl) {
    return json.targetUrl;
  }
  
  // Verifica URL de download no campo file.download
  if (json.file && json.file.download) {
    return json.file.download;
  }
  
  // Verifica campo @id para construir uma URL de download
  if (json['@id']) {
    return `${json['@id']}/@@download/file`;
  }
  
  return null;
};

/**
 * Retorna a configuração de opções do PDF.js
 * @returns {Object} Objeto com opções do PDF.js
 */
export const getPdfOptions = () => {
  return {
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/',
  };
};
