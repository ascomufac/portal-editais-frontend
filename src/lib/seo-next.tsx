import {
  absoluteUrl,
  pageTitle,
  SITE_NAME,
  truncateDescription,
  type JsonLd,
} from '@/lib/seo';
import type { Metadata } from 'next';

type BuildMetadataInput = {
  title?: string | null;
  description?: string | null;
  path?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string | null;
};

export function buildMetadata({
  title,
  description,
  path = '/',
  noIndex = false,
  ogType = 'website',
  ogImage,
}: BuildMetadataInput): Metadata {
  const fullTitle = pageTitle(title);
  const desc = truncateDescription(description);
  const url = absoluteUrl(path);
  const image = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : absoluteUrl(ogImage)
    : absoluteUrl('/og-image.png');

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type: ogType,
      locale: 'pt_BR',
      siteName: SITE_NAME,
      title: fullTitle,
      description: desc,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [image],
    },
  };
}

export function JsonLdScript({ data }: { data: JsonLd }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
