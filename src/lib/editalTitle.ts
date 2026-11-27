/**
 * Separa títulos no padrão "Edital Prograd nº 46/2026 - Processo Seletivo..."
 * em identificador (número do edital) e assunto, para o card destacar o que
 * diferencia um edital do outro.
 */
export interface EditalTitleParts {
  /** Ex.: "Edital Prograd nº 46/2026" — null quando o título não segue o padrão. */
  identifier: string | null;
  /** Assunto do edital, ou o título inteiro quando não há identificador. */
  subject: string;
}

const EDITAL_TITLE_RE =
  // Sem flag `i`: o separador "só espaço" exige assunto começando em maiúscula.
  /^(.{0,80}?\b[nN]\s*\.?\s*[º°oO]?\s*\.?\s*\d+(?:\s*[./-]\s*\d+)*)(?:\s*[-–—:]\s*|\s+(?=\p{Lu}))(.+)$/u;

export const splitEditalTitle = (title: string): EditalTitleParts => {
  const trimmed = title.trim();
  const match = EDITAL_TITLE_RE.exec(trimmed);
  if (!match || !/\p{L}.*\p{L}/u.test(match[2])) {
    return { identifier: null, subject: trimmed };
  }
  return { identifier: match[1].trim(), subject: match[2].trim() };
};
