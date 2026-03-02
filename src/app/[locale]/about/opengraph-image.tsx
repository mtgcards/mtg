import { getTranslations } from 'next-intl/server';
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return buildOgImage(t('title'));
}
