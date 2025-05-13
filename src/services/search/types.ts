
/**
 * Interface for results of busca
 * @interface SearchResult
 * @property {string} id - Identificador único do resultado
 * @property {string} title - Título do resultado
 * @property {string} [description] - Descrição opcional do resultado
 * @property {string} url - URL para acessar o resultado
 * @property {string} [section] - Seção a que pertence o resultado
 * @property {string} [date] - Data do resultado
 * @property {string} [type] - Tipo do resultado
 */
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  section?: string;
  date?: string;
  type?: string;
}

/**
 * Tipo para as diferentes seções de busca disponíveis
 * @typedef {string} SearchSection
 * @description Define as categorias de busca suportadas pelo sistema
 */
export type SearchSection = 
  'all' | 
  'graduacao' | 
  'pos-graduacao' | 
  'extensao' | 
  'estudantis' | 
  'pessoas' | 
  'idiomas' | 
  'colegio' | 
  'reitoria' |
  'centros' |
  'cooperacao-interinstitucional' |
  'dce' |
  'niead' |
  'nups' |
  'outros';

/**
 * Mapeamento das seções de busca para os caminhos na API
 * @type {Record<string, string>}
 */
export const sectionPathMap: Record<string, string> = {
  'graduacao': 'prograd',
  'pos-graduacao': 'propeg',
  'extensao': 'proex',
  'estudantis': 'proaes',
  'pessoas': 'prodgep',
  'idiomas': 'centro-idiomas',
  'colegio': 'colegio-de-aplicacao',
  'reitoria': 'conselho-universitario',
  'centros': 'centros',
  'cooperacao-interinstitucional': 'cooperacao-interinstitucional',
  'dce': 'dce',
  'niead': 'niead',
  'nups': 'nups',
  'outros': 'outros'
};
