import type { Metadata } from 'next';
import { SITE_NAME, OG_LOCALES } from './constants';

export function pageTitle(pageName: string): string {
  return `${pageName} | ${SITE_NAME}`;
}

export function buildFormatMetadata(
  label: string,
  description: string,
  pageUrl: string,
  locale?: string,
  title?: string,
): Metadata {
  const metaTitle = title ?? pageTitle(label);
  const ogLocale = OG_LOCALES[locale ?? 'ja'] ?? 'ja_JP';
  return {
    title: metaTitle,
    description,
    openGraph: {
      title: metaTitle,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: ogLocale,
    },
    twitter: {
      card: 'summary',
      title: metaTitle,
      description,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}
