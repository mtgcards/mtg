import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { fetchCardsForFormat } from '@/lib/cards';
import { ALL_FORMAT_KEYS, TAB_LABELS, FORMAT_DESCRIPTIONS, SITE_URL, DEFAULT_FORMAT, buildFormatMetadata } from '@/lib/constants';
import { FormatKey } from '@/lib/types';
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
  const formatKey = format as FormatKey;

  if (!ALL_FORMAT_KEYS.includes(formatKey)) {
    return {};
  }

  const label = TAB_LABELS[formatKey];
  const description = FORMAT_DESCRIPTIONS[formatKey];
  const pageUrl = `${SITE_URL}/${format}`;

  return buildFormatMetadata(label, description, pageUrl);
}

export default async function FormatPage({ params }: FormatPageProps) {
  const { format } = await params;

  if (!ALL_FORMAT_KEYS.includes(format as FormatKey)) {
    notFound();
  }

  if (format === DEFAULT_FORMAT) {
    redirect('/');
  }

  const formatKey = format as FormatKey;
  const cards = await fetchCardsForFormat(formatKey);
  const label = TAB_LABELS[formatKey];
  const pageUrl = `${SITE_URL}/${format}`;

  return <CardPageLayout cards={cards} format={formatKey} label={label} pageUrl={pageUrl} />;
}
