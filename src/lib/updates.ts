import type { Update } from '@/components/UpdatesSection';
import {
  setorTitles,
  toItemHref,
  toSitePath,
  type EditalItem,
} from '@/services/editalService';

/** Rótulos curtos de setor para as etiquetas da home (o id Plone não muda). */
const SETOR_TAGS: Record<string, string> = {
  prograd: 'Prograd',
  propeg: 'Proppi (Propeg)',
  proppi: 'Proppi',
  proex: 'Proex',
  proaes: 'Proaes',
  prodgep: 'Prodgep',
  proplan: 'Proplan',
  'colegio-de-aplicacao': 'Colégio de Aplicação',
  'centro-idiomas': 'Centro de Idiomas',
  'conselho-universitario': 'Conselho Universitário',
  centros: 'Centros de Ensino',
  nups: 'NUPS',
  niead: 'Niead',
  dce: 'DCE',
  'cooperacao-interinstitucional': 'Cooperação Interinstitucional',
  outros: 'Outros',
};

/** Setor = primeiro segmento do caminho Plone do item. */
export const setorTagFromId = (itemId: string): string => {
  const setorId = toSitePath(itemId).split('/').filter(Boolean)[0] || '';
  if (!setorId) return '';
  return SETOR_TAGS[setorId] || setorTitles[setorId] || '';
};

/** Quantidade de atualizações por página na home. */
export const HOME_UPDATES_PAGE = 10;

/** Número de edital no título: "01/2026", "33-2024"… */
const EDITAL_NUMBER = /\d+\s*[/-]\s*\d{4}/;

/** Sem o número do edital no título (ex.: só "Edital"), antepõe o título da pasta. */
export const updateTitle = (item: EditalItem): string => {
  const title = item.title || 'Sem título';
  if (EDITAL_NUMBER.test(title) || !item.parentTitle) return title;
  return `${item.parentTitle} - ${title}`;
};

export const mapItemToUpdate = (item: EditalItem): Update => ({
  id: item['@id'],
  title: updateTitle(item),
  dateISO: item.modified || item.created || '',
  setor: setorTagFromId(item['@id']),
  typeLabel: item.type_title || item['@type'] || '',
  href: toItemHref(item),
});

export const mapRecentToUpdates = (recent: EditalItem[]): Update[] =>
  recent.map(mapItemToUpdate);

export type UpdatesPeriod = 'all' | 'today' | 'week' | 'month';

export const UPDATES_PERIOD_LABELS: Record<UpdatesPeriod, string> = {
  all: 'Todas',
  today: 'Hoje',
  week: 'Esta semana',
  month: 'Este mês',
};

/** Início do período (YYYY-MM-DD, fuso do Acre) ou undefined para "todas". */
export const periodStart = (
  period: UpdatesPeriod,
  now: Date = new Date()
): string | undefined => {
  if (period === 'all') return undefined;
  const [y, m, d] = now
    .toLocaleDateString('en-CA', { timeZone: 'America/Rio_Branco' })
    .split('-')
    .map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  if (period === 'week') start.setUTCDate(start.getUTCDate() - 6);
  if (period === 'month') start.setUTCDate(1);
  return start.toISOString().slice(0, 10);
};
