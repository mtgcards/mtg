import { getTranslations } from 'next-intl/server';
import { SerializedCard, FormatKey } from '@/lib/types';
import { SITE_URL, DEFAULT_THRESHOLDS } from '@/lib/constants';
import { filterCardsByThreshold } from '@/lib/utils';
import TabBar from './TabBar';
import CardGrid from './CardGrid';
import { BreadcrumbJsonLd, ItemListJsonLd } from './JsonLd';

interface CardPageLayoutProps {
  cards: SerializedCard[];
  format: FormatKey;
  label: string;
  pageUrl: string;
}

export default async function CardPageLayout({ cards, format, label, pageUrl }: CardPageLayoutProps) {
  const ts = await getTranslations('site');
  const tn = await getTranslations('nav');
  const tp = await getTranslations('formatPageTitles');

  const listName = tp.has(format) ? tp(format) : tp('default', { label });
  const defaultFilteredCards = filterCardsByThreshold(cards, format, DEFAULT_THRESHOLDS);

  return (
    <main>
      <ItemListJsonLd name={listName} url={pageUrl} cards={defaultFilteredCards} />
      <BreadcrumbJsonLd
        items={[
          { name: tn('home'), url: SITE_URL },
          { name: label, url: pageUrl },
        ]}
      />
      <div className="top-bar">
        <div className="header-compact">
          <h1>{ts('name')}</h1>
        </div>
        <TabBar activeFormat={format} />
        <CardGrid cards={cards} format={format} />
      </div>
    </main>
  );
}
