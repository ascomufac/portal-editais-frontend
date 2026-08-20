/**
 * Versão embutida no build (NEXT_PUBLIC_*).
 * Em produção: semver da tag Git + SHA. Em local: describe ou fallback.
 */

const rawVersion = (
  process.env.NEXT_PUBLIC_APP_VERSION ||
  process.env.npm_package_version ||
  '0.0.0'
).trim();

const rawSha = (process.env.NEXT_PUBLIC_GIT_SHA || '').trim();

export const appBuildTime = (process.env.NEXT_PUBLIC_BUILD_TIME || '').trim();

/** Semver limpo sem prefixo v (ex.: 1.2.3). */
export const appVersion = rawVersion.replace(/^v/, '').split(/[-+]/)[0] || '0.0.0';

/** Short SHA (7) ou string vazia. */
export const appGitSha = rawSha.slice(0, 7);

/** Exibição discreta na UI (ex.: v1.2.3). */
export const appVersionDisplay = appVersion.startsWith('0.0.0')
  ? rawSha
    ? `v · ${appGitSha}`
    : 'v · local'
  : `v${appVersion}`;

/** Identidade completa semver+build (ex.: v1.2.3+761e60a). */
export const appVersionFull = appGitSha
  ? `v${appVersion}+${appGitSha}`
  : `v${appVersion}`;

export function appVersionTooltip(): string {
  const parts = [appVersionFull];
  if (appBuildTime) {
    try {
      const d = new Date(appBuildTime);
      if (!Number.isNaN(d.getTime())) {
        parts.push(
          `build ${new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(d)}`
        );
      }
    } catch {
      parts.push(`build ${appBuildTime}`);
    }
  }
  return parts.join(' · ');
}
