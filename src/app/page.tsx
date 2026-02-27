import type { Metadata } from 'next';
import { fetchCardsForFormat } from '@/lib/cards';
import { SITE_URL, DEFAULT_FORMAT, TAB_LABELS, FORMAT_DESCRIPTIONS, buildFormatMetadata } from '@/lib/constants';
import CardPageLayout from '@/components/CardPageLayout';

const label = TAB_LABELS[DEFAULT_FORMAT];
const description = FORMAT_DESCRIPTIONS[DEFAULT_FORMAT];

export const metadata: Metadata = buildFormatMetadata(label, description, SITE_URL);

export default async function HomePage() {
  const cards = await fetchCardsForFormat(DEFAULT_FORMAT);

  return <CardPageLayout cards={cards} format={DEFAULT_FORMAT} label={label} pageUrl={SITE_URL} />;
}
