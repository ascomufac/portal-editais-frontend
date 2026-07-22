/**
 * URLs do site Plone UFAC.
 * No browser: proxy same-origin `/__plone__` (CORS/Varnish).
 * No servidor Next: URL absoluta via PLONE_ORIGIN.
 */
const PLONE_ORIGIN = (
  process.env.PLONE_ORIGIN ||
  process.env.NEXT_PUBLIC_PLONE_ORIGIN ||
  'https://www3.ufac.br'
).replace(/\/+$/, '');

export const SITE_URL = PLONE_ORIGIN;

const isServer = typeof window === 'undefined';

/** API Plone (++api++) — absoluta no server, proxy no client */
export const BASE_URL = isServer
  ? `${PLONE_ORIGIN}/++api++`
  : '/__plone__/++api++';

export const getPublicSiteUrl = (): string =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080').replace(
    /\/+$/,
    ''
  );

/** Um dia em segundos */
export const DAY_IN_SECONDS = 86_400;

/**
 * TTL do cache ISR (público) em segundos.
 * Preferir PLONE_REVALIDATE_DAYS; PLONE_REVALIDATE_SECONDS ainda é aceito.
 */
export const getRevalidateSeconds = (): number => {
  const days = Number(process.env.PLONE_REVALIDATE_DAYS);
  if (Number.isFinite(days) && days > 0) {
    return Math.round(days * DAY_IN_SECONDS);
  }
  const seconds = Number(process.env.PLONE_REVALIDATE_SECONDS);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.round(seconds);
  }
  return DAY_IN_SECONDS;
};
