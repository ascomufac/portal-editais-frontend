/** @type {import('next').NextConfig} */
const PLONE_ORIGIN = process.env.PLONE_ORIGIN || 'https://www3.ufac.br';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
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
