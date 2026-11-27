/**
 * Converte títulos ESCRITOS TODOS EM MAIÚSCULAS para "Título com Iniciais
 * Maiúsculas", mais fácil de ler. Títulos já em caixa mista ficam intactos.
 *
 * Num texto todo em maiúsculas não dá para saber o que é sigla; por isso
 * mantemos em maiúsculas: siglas conhecidas, siglas de programas (PPG…),
 * palavras sem vogal (CCSD, CFCH) e números romanos (XIV).
 */

/** Siglas mantidas em maiúsculas. Acrescente aqui quando aparecer uma nova. */
const ACRONYMS = new Set([
  // Instituição e setores
  'UFAC', 'PROGRAD', 'PROPEG', 'PROPPI', 'PROEX', 'PROAES', 'PRODGEP', 'PROAFE',
  'PROPLAN', 'DAEX', 'DACIC', 'NUPS', 'NIEAD', 'NAI', 'DCE', 'CAP', 'CEL', 'CELA',
  'CCBN', 'CCET', 'CCSD', 'CCJSA', 'CFCH', 'CMULTI', 'CONSU', 'CEPEX', 'REDCIM', 'REDECIM',
  // Programas e cursos
  'ABI', 'EAD', 'PET', 'PIBIC', 'PIBITI', 'PIBID', 'PIBEX', 'PDSE', 'PARFOR',
  'PROFIAP', 'PROFLETRAS', 'PROFMAT', 'PROFEI', 'PROFNIT', 'PROFHISTÓRIA',
  'PROFSAÚDE', 'PROFBIO', 'PROFQUI', 'PROFÁGUA', 'PROMAED', 'MPECIM', 'PPEHL',
  'EDUCANORTE', 'PGEDA', 'PAA', 'TCC',
  // Órgãos e exames externos
  'CAPES', 'CNPQ', 'MEC', 'MCTI', 'FAPAC', 'FINEP', 'SBF', 'ENEM', 'SISU',
  'ENADE', 'ENA', 'INEP', 'SUS', 'SECIS', 'ANA', 'ANPAD', 'TOEFL', 'IELTS',
  // Documentos e outros
  'CPF', 'RG', 'PDF', 'TI', 'PCD', 'PNE',
]);

/** Palavras que ficam minúsculas no meio do título. */
const LOWER_WORDS = new Set([
  'a', 'à', 'ao', 'aos', 'as', 'às', 'com', 'da', 'das', 'de', 'do', 'dos',
  'e', 'em', 'na', 'nas', 'no', 'nos', 'o', 'os', 'ou', 'para', 'pela',
  'pelas', 'pelo', 'pelos', 'por', 'sem', 'sob', 'um', 'uma',
]);

const ROMAN_RE = /^(?=[IVX])X{0,3}(?:IX|IV|V?I{0,3})$/;
const VOWEL_RE = /[AEIOUÁÉÍÓÚÂÊÔÃÕÀÜY]/;

/** Mais de 70% das letras em maiúsculas (e texto com letras suficientes). */
export const isShouting = (text: string): boolean => {
  const letters = text.replace(/[^\p{L}]/gu, '');
  if (letters.length < 8) return false;
  const upper = letters.replace(/[^\p{Lu}]/gu, '').length;
  return upper / letters.length > 0.7;
};

const keepUpper = (word: string): boolean =>
  ACRONYMS.has(word) ||
  word.startsWith('PPG') ||
  ROMAN_RE.test(word) ||
  (word.length >= 2 && word.length <= 6 && !VOWEL_RE.test(word));

const capitalize = (word: string) =>
  word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1).toLocaleLowerCase('pt-BR');

export const toTitleCase = (text: string): string => {
  let first = true;
  // Começo de frase: início do texto ou depois de "-", ":", "–", "—", "(".
  let sentenceStart = true;

  return text.replace(/\p{L}+|[^\p{L}]+/gu, (token, offset: number) => {
    if (!/\p{L}/u.test(token)) {
      if (/[-–—:]\s*$/.test(token) && /\s/.test(token)) sentenceStart = true;
      return token;
    }

    const prev = text.charAt(offset - 1);
    const isStart = first || sentenceStart;
    first = false;
    sentenceStart = false;

    if (keepUpper(token)) return token;

    const lower = token.toLocaleLowerCase('pt-BR');
    // "(A)" em "COORDENADOR(A)" → "Coordenador(a)".
    if (prev === '(' && token.length === 1) return lower;
    // Ordinais escritos com letra: "1A CHAMADA" → "1a Chamada".
    if (/\d/.test(prev) && token.length <= 2) return lower;
    if (!isStart && LOWER_WORDS.has(lower)) return lower;
    return capitalize(token);
  });
};

/** Aplica toTitleCase só em títulos "gritados"; os demais voltam como estão. */
export const readableTitle = (title: string): string =>
  isShouting(title) ? toTitleCase(title) : title;
