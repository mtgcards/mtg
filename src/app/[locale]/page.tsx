import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { loadCardsForFormat } from '@/lib/cards';
import { DEFAULT_FORMAT, FORMAT_PAGE_TITLES } from '@/lib/constants';
import { buildFormatMetadata } from '@/lib/metadata';
import CardPageLayout from '@/components/CardPageLayout';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'formats' });
  const td = await getTranslations({ locale, namespace: 'formatDescriptions' });

  const label = t(DEFAULT_FORMAT);
  const description = td(DEFAULT_FORMAT);
  const title = FORMAT_PAGE_TITLES[DEFAULT_FORMAT];

  const pageUrl = `/${locale}`;
  return buildFormatMetadata(label, description, pageUrl, locale, title);
}

export default async function HomePage(
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cards = loadCardsForFormat(DEFAULT_FORMAT);
  const t = await getTranslations({ locale, namespace: 'formats' });
  const label = t(DEFAULT_FORMAT);

  const pageUrl = `/${locale}`;
  return <CardPageLayout cards={cards} format={DEFAULT_FORMAT} label={label} pageUrl={pageUrl} />;
}
