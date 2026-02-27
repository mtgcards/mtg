import { SerializedCard, FormatKey } from '@/lib/types';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import TabBar from './TabBar';
import CardGrid from './CardGrid';
import { BreadcrumbJsonLd } from './JsonLd';

interface CardPageLayoutProps {
  cards: SerializedCard[];
  format: FormatKey;
  label: string;
  pageUrl: string;
}

export default function CardPageLayout({ cards, format, label, pageUrl }: CardPageLayoutProps) {
  return (
    <main>
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
