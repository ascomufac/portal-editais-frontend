
/**
 * Verifica se uma URL é de um arquivo PDF
 * @param {string} url - URL para verificar
 * @returns {boolean} - true se for um PDF, false caso contrário
 */
export const isPdf = (url: string): boolean => {
  // Handle undefined or null values
  if (!url) return false;
  
  // Verifica extensão .pdf no final da URL
  if (url.toLowerCase().endsWith('.pdf')) return true;
  
  // Verifica se há /view ou /download seguido por /pdf no URL (caso seja um visualizador de PDF)
  if (url.toLowerCase().includes('/view/pdf') || url.toLowerCase().includes('/download/pdf')) return true;
  
  // Verifica se a URL contém file_pdf ou pdf_file em seu caminho
  if (url.toLowerCase().includes('file_pdf') || url.toLowerCase().includes('pdf_file')) return true;
  
  return false;
};

/**
 * Extrai o nome do arquivo de uma URL
 * @param {string} url - URL do arquivo
 * @returns {string} - Nome do arquivo extraído
 */
export const extractFileNameFromUrl = (url: string): string => {
  try {
    // Tentar obter apenas o nome do arquivo sem a extensão
    const path = new URL(url).pathname;
    const filename = path.split('/').pop() || '';
    const nameWithoutExtension = filename.split('.')[0];
    
    // Substituir hifens e underscores por espaços
    return nameWithoutExtension
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2') // adiciona espaço entre camelCase
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitaliza primeiras letras
  } catch (e) {
    // Fallback para caso não seja possível processar a URL
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Documento';
  }
};

/**
 * Avalia a relevância de um resultado de busca com base no termo de busca
 * @param {any} result - Resultado da busca
 * @param {string} searchTerm - Termo de busca
 * @returns {number} - Pontuação de relevância
 */
export const calculateResultRelevance = (result: any, searchTerm: string): number => {
  const searchTermLower = searchTerm.toLowerCase();
  const titleLower = (result.title || '').toLowerCase();
  const descriptionLower = (result.description || '').toLowerCase();
  
  let score = 0;
  
  // Título contém exatamente o termo de busca
  if (titleLower === searchTermLower) {
    score += 100;
  }
  // Título começa com o termo de busca
  else if (titleLower.startsWith(searchTermLower)) {
    score += 80;
  }
  // Título contém o termo de busca
  else if (titleLower.includes(searchTermLower)) {
    score += 60;
  }
  
  // Descrição contém o termo de busca
  if (descriptionLower.includes(searchTermLower)) {
    score += 40;
  }
  
  // Data recente (se disponível)
  if (result.date) {
    try {
      const resultDate = new Date(result.date);
      const now = new Date();
      const ageInDays = (now.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Documentos mais recentes recebem pontuação mais alta
      if (ageInDays < 30) {
        score += 20; // Último mês
      } else if (ageInDays < 90) {
        score += 10; // Últimos 3 meses
      } else if (ageInDays < 365) {
        score += 5; // Último ano
      }
    } catch (e) {
      // Ignorar erro de parsing de data
    }
  }
  
  return score;
};
