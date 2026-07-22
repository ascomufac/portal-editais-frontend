import { getPublicSiteUrl } from '@/services/ploneConfig';

export const SITE_NAME = 'Portal de Editais UFAC';
export const SITE_NAME_SHORT = 'UFAC Editais';

export const absoluteUrl = (path = '/'): string => {
  const base = getPublicSiteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const pageTitle = (page?: string | null): string => {
  const t = (page || '').trim();
  return t ? `${t} | ${SITE_NAME}` : SITE_NAME;
};

export const truncateDescription = (
  text?: string | null,
  max = 160
): string => {
  const raw = (text || '').replace(/\s+/g, ' ').trim();
  if (!raw) {
    return 'Editais e processos seletivos da Universidade Federal do Acre (UFAC).';
  }
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1).trimEnd()}…`;
};

export type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'GovernmentOrganization',
  name: 'Universidade Federal do Acre',
  alternateName: 'UFAC',
  url: 'https://www.ufac.br',
  parentOrganization: {
    '@type': 'GovernmentOrganization',
    name: 'Brasil',
  },
});

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: absoluteUrl('/'),
  publisher: {
    '@type': 'GovernmentOrganization',
    name: 'Universidade Federal do Acre',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${absoluteUrl('/resultados-busca')}?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbJsonLd = (
  items: { name: string; path: string }[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const editalJsonLd = (input: {
  title: string;
  description?: string;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'DigitalDocument',
  name: input.title,
  description: truncateDescription(input.description, 300),
  url: absoluteUrl(input.url),
  inLanguage: 'pt-BR',
  datePublished: input.datePublished || undefined,
  dateModified: input.dateModified || undefined,
  provider: {
    '@type': 'GovernmentOrganization',
    name: 'Universidade Federal do Acre',
    url: 'https://www.ufac.br',
  },
});
