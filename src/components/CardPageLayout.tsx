import { SerializedCard, FormatKey } from '@/lib/types';
import { SITE_URL, SITE_NAME, FORMAT_PAGE_TITLES, TAB_LABELS, DEFAULT_THRESHOLDS } from '@/lib/constants';
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

export default function CardPageLayout({ cards, format, label, pageUrl }: CardPageLayoutProps) {
  const listName = FORMAT_PAGE_TITLES[format] ?? `${TAB_LABELS[format]} 高額コモン・アンコモン`;
  const defaultFilteredCards = filterCardsByThreshold(cards, format, DEFAULT_THRESHOLDS);

  return (
    <main>
      <ItemListJsonLd name={listName} url={pageUrl} cards={defaultFilteredCards} />
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', url: SITE_URL },
          { name: label, url: pageUrl },
        ]}
      />
      <div className="top-bar">
        <div className="header-compact">
          <h1>{SITE_NAME}</h1>
        </div>
        <TabBar activeFormat={format} />
        <CardGrid cards={cards} format={format} />
      </div>
    </main>
  );
}
