import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { fetchCardsForFormat } from '@/lib/cards';
import { ALL_FORMAT_KEYS, TAB_LABELS, FORMAT_DESCRIPTIONS, FORMAT_PAGE_TITLES, SITE_URL, DEFAULT_FORMAT, buildFormatMetadata } from '@/lib/constants';
import { isFormatKey } from '@/lib/utils';
import CardPageLayout from '@/components/CardPageLayout';

export function generateStaticParams() {
  return ALL_FORMAT_KEYS
    .filter((key) => key !== DEFAULT_FORMAT)
    .map((format) => ({ format }));
}

interface FormatPageProps {
  params: Promise<{ format: string }>;
}

export async function generateMetadata({ params }: FormatPageProps): Promise<Metadata> {
  const { format } = await params;

  if (!isFormatKey(format)) {
    return {};
  }

  const label = TAB_LABELS[format];
  const description = FORMAT_DESCRIPTIONS[format];
  const pageUrl = `${SITE_URL}/${format}`;

  return buildFormatMetadata(label, description, pageUrl, FORMAT_PAGE_TITLES[format]);
}

export default async function FormatPage({ params }: FormatPageProps) {
  const { format } = await params;

  if (!isFormatKey(format)) {
    notFound();
  }

  if (format === DEFAULT_FORMAT) {
    redirect('/');
  }

  const cards = await fetchCardsForFormat(format);
  const label = TAB_LABELS[format];
  const pageUrl = `${SITE_URL}/${format}`;

  return <CardPageLayout cards={cards} format={format} label={label} pageUrl={pageUrl} />;
}
