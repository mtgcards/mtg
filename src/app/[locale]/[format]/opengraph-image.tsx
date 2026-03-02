import { getTranslations } from 'next-intl/server';
import { isFormatKey } from '@/lib/utils';
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';
import { routing } from '@/i18n/routing';
import { ALL_FORMAT_KEYS, DEFAULT_FORMAT } from '@/lib/constants';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ALL_FORMAT_KEYS
      .filter((key) => key !== DEFAULT_FORMAT)
      .map((format) => ({ locale, format }))
  );
}

export default async function Image({ params }: { params: Promise<{ locale: string; format: string }> }) {
  const { locale, format } = await params;

  if (!isFormatKey(format)) {
    return new Response('Not Found', { status: 404 });
  }

  const tf = await getTranslations({ locale, namespace: 'formats' });
  const tp = await getTranslations({ locale, namespace: 'formatPageTitles' });
  const td = await getTranslations({ locale, namespace: 'formatDescriptions' });
  const ts = await getTranslations({ locale, namespace: 'site' });

  const title = tp.has(format) ? tp(format) : `${tf(format)} | ${ts('name')}`;
  const description = td(format);
  return buildOgImage(title, description);
}
