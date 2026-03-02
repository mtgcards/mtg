import { getTranslations } from 'next-intl/server';
import { isFormatKey } from '@/lib/utils';
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

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
