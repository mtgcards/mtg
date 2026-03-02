import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchCardsForFormat } from '@/lib/cards';
import { SITE_URL, DEFAULT_FORMAT, buildFormatMetadataI18n } from '@/lib/constants';
import CardPageLayout from '@/components/CardPageLayout';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'formats' });
  const td = await getTranslations({ locale, namespace: 'formatDescriptions' });
  const tp = await getTranslations({ locale, namespace: 'formatPageTitles' });

  const label = t(DEFAULT_FORMAT);
  const description = td(DEFAULT_FORMAT);
  const title = tp.has('y1995_2003') ? tp('y1995_2003') : undefined;

  return buildFormatMetadataI18n(label, description, SITE_URL, locale, title);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cards = await fetchCardsForFormat(DEFAULT_FORMAT);
  const t = await getTranslations({ locale, namespace: 'formats' });
  const label = t(DEFAULT_FORMAT);

  return <CardPageLayout cards={cards} format={DEFAULT_FORMAT} label={label} pageUrl={SITE_URL} />;
}
