import { t, tHas } from '@/lib/i18n';
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

export default function CardPageLayout({ cards, format, label, pageUrl }: CardPageLayoutProps) {
  const listName = tHas(`formatPageTitles.${format}`) ? t(`formatPageTitles.${format}`) : t('formatPageTitles.default', { label });
  const defaultFilteredCards = filterCardsByThreshold(cards, format, DEFAULT_THRESHOLDS);

  // Extract locale from pageUrl (e.g., "/ja" or "/ja/y2004_2014" -> "ja")
  const locale = pageUrl.split('/')[1] || 'ja';
  const homeUrl = `${SITE_URL}/${locale}/`;
  const currentUrl = `${SITE_URL}${pageUrl.startsWith('/') ? pageUrl : `/${pageUrl}`}`;

  return (
    <main>
      <ItemListJsonLd name={listName} url={currentUrl} cards={defaultFilteredCards} />
      <BreadcrumbJsonLd
        items={[
          { name: t('nav.home'), url: homeUrl },
          { name: label, url: currentUrl },
        ]}
      />
      <div className="top-bar">
        <div className="header-compact">
          <h1>{t('site.name')}</h1>
        </div>
        <TabBar activeFormat={format} />
        <CardGrid cards={cards} format={format} />
      </div>
    </main>
  );
}
