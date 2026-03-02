import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchCardsForFormat } from '@/lib/cards';
import { ALL_FORMAT_KEYS, SITE_URL, DEFAULT_FORMAT, buildFormatMetadataI18n } from '@/lib/constants';
import { isFormatKey } from '@/lib/utils';
import { redirect } from '@/i18n/navigation';
import CardPageLayout from '@/components/CardPageLayout';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ALL_FORMAT_KEYS
      .filter((key) => key !== DEFAULT_FORMAT)
      .map((format) => ({ locale, format }))
  );
}
interface FormatPageProps {
  params: Promise<{ locale: string; format: string }>;
}

export async function generateMetadata({ params }: FormatPageProps): Promise<Metadata> {
  const { locale, format } = await params;

  if (!isFormatKey(format)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'formats' });
  const td = await getTranslations({ locale, namespace: 'formatDescriptions' });
  const tp = await getTranslations({ locale, namespace: 'formatPageTitles' });

  const label = t(format);
  const description = td(format);
  const pageUrl = `${SITE_URL}/${format}`;
  const title = tp.has(format) ? tp(format) : undefined;

  return buildFormatMetadataI18n(label, description, pageUrl, locale, title);
}

export default async function FormatPage({ params }: FormatPageProps) {
  const { locale, format } = await params;
  setRequestLocale(locale);

  if (!isFormatKey(format)) {
    notFound();
  }

  if (format === DEFAULT_FORMAT) {
    redirect({ href: '/', locale });
  }

  const cards = await fetchCardsForFormat(format);
  const t = await getTranslations({ locale, namespace: 'formats' });
  const label = t(format);
  const pageUrl = `${SITE_URL}/${format}`;

  return <CardPageLayout cards={cards} format={format} label={label} pageUrl={pageUrl} />;
}
