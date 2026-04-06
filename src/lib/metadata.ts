import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, OG_LOCALES } from './constants';

export function pageTitle(pageName: string): string {
  return `${pageName} | ${SITE_NAME}`;
}

const LOCALES = ['ja', 'en', 'fr', 'de'];

function buildLanguages(pagePath: string): Record<string, string> {
  // hreflang 用の言語別 URL を生成
  // pagePath は "/ja" や "/ja/about" や "/ja/y2004_2014" の形式（相対パス）
  const siteOrigin = SITE_URL;
  
  // パスから言語部分を除去してベースパスを取得
  // "/ja/about" -> "/about"
  const pathWithoutLocale = pagePath.replace(/^\/[^/]+/, '')
  const basePath = pathWithoutLocale || '/';
  
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = `${siteOrigin}/${loc}${basePath === '/' ? '' : basePath}`;
  }
  
  // x-default は言語指定なしの URL（リダイレクト先の先頭言語版）
  const defaultLang = LOCALES[0];
  languages['x-default'] = `${siteOrigin}/${defaultLang}${basePath === '/' ? '' : basePath}`;
  
  return languages;
}

function buildCanonical(pagePath: string): string {
  // canonical URL を生成
  // pagePath は "/ja" や "/ja/about" の形式（相対パス）
  return `${SITE_URL}${pagePath}`;
}

export function buildFormatMetadata(
  label: string,
  description: string,
  pagePath: string,
  locale?: string,
  title?: string,
): Metadata {
  const metaTitle = title ?? pageTitle(label);
  const ogLocale = OG_LOCALES[locale ?? 'ja'] ?? 'ja_JP';
  const languages = buildLanguages(pagePath);
  const canonical = buildCanonical(pagePath);
  
  return {
    title: metaTitle,
    description,
    openGraph: {
      title: metaTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocale,
    },
    twitter: {
      card: 'summary',
      title: metaTitle,
      description,
    },
    alternates: {
      canonical,
      languages,
    },
  };
}

export function buildPageMetadata(
  title: string,
  description: string,
  pagePath: string,
  locale?: string,
): Metadata {
  const metaTitle = pageTitle(title);
  const ogLocale = OG_LOCALES[locale ?? 'ja'] ?? 'ja_JP';
  const languages = buildLanguages(pagePath);
  const canonical = buildCanonical(pagePath);
  
  return {
    title: metaTitle,
    description,
    openGraph: {
      title: metaTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocale,
    },
    twitter: {
      card: 'summary',
      title: metaTitle,
      description,
    },
    alternates: {
      canonical,
      languages,
    },
  };
}
