import { execSync } from 'node:child_process';

/** @type {import('next').NextConfig} */
const PLONE_ORIGIN = process.env.PLONE_ORIGIN || 'https://www3.ufac.br';

const tryGit = (cmd) => {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
};

const resolveAppVersion = () => {
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    return process.env.NEXT_PUBLIC_APP_VERSION.replace(/^v/, '');
  }
  const described = tryGit('git describe --tags --always --match "v*"');
  if (described) {
    // v1.2.3 ou v1.2.3-2-gabc1234 → 1.2.3
    const m = described.match(/^v?(\d+\.\d+\.\d+)/);
    if (m) return m[1];
    return described.replace(/^v/, '');
  }
  return process.env.npm_package_version || '0.0.0';
};

const resolveGitSha = () => {
  if (process.env.NEXT_PUBLIC_GIT_SHA) {
    return process.env.NEXT_PUBLIC_GIT_SHA.slice(0, 7);
  }
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA.slice(0, 7);
  }
  return tryGit('git rev-parse --short HEAD') || 'local';
};

const resolveBuildTime = () =>
  process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

const NEXT_PUBLIC_APP_VERSION = resolveAppVersion();
const NEXT_PUBLIC_GIT_SHA = resolveGitSha();
const NEXT_PUBLIC_BUILD_TIME = resolveBuildTime();

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_GIT_SHA,
    NEXT_PUBLIC_BUILD_TIME,
  },
  // Next 16 usa Turbopack por padrão; alias do webpack cobre `next build --webpack`
  turbopack: {
    resolveAlias: {
      canvas: { browser: './src/lib/empty-module.js' },
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www3.ufac.br' },
      { protocol: 'https', hostname: 'www.ufac.br' },
    ],
  },
  serverExternalPackages: ['canvas'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  async redirects() {
    return [
      { source: '/graduacao', destination: '/setor/prograd', permanent: true },
      { source: '/pos-graduacao', destination: '/setor/propeg', permanent: true },
      { source: '/extensao', destination: '/setor/proex', permanent: true },
      { source: '/estudantis', destination: '/setor/proaes', permanent: true },
      { source: '/pessoas', destination: '/setor/prodgep', permanent: true },
      { source: '/idiomas', destination: '/setor/centro-idiomas', permanent: true },
      { source: '/colegio', destination: '/setor/colegio-de-aplicacao', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/__plone__/:path*',
        destination: `${PLONE_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
