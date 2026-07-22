import Providers from '@/components/Providers';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';
import { buildMetadata } from '@/lib/seo-next';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import '@/index.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: null,
    description:
      'Portal oficial de editais e processos seletivos da Universidade Federal do Acre (UFAC).',
    path: '/',
  }),
  metadataBase: new URL(absoluteUrl('/')),
  applicationName: SITE_NAME,
  authors: [{ name: 'UFAC' }],
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
