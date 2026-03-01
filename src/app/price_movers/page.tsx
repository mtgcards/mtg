import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, pageTitle } from '@/lib/constants';
import { fetchPriceMovers } from '@/lib/price-movers';
import TabBar from '@/components/TabBar';
import PriceMoversGrid from '@/components/PriceMoversGrid';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

const label = '値上がり';
const description = 'MTGのコモン・アンコモンカードで値上がりが大きいカードをランキング表示。24時間・1週間・1ヶ月・3ヶ月の値上がりを確認できます。';
const pageUrl = `${SITE_URL}/price_movers`;

export const metadata: Metadata = {
  title: pageTitle(label),
  description,
  openGraph: {
    title: pageTitle(label),
    description,
    url: pageUrl,
    siteName: SITE_NAME,
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: pageTitle(label),
    description,
  },
  alternates: {
    canonical: pageUrl,
  },
};

export default function PriceMoversPage() {
  const data = fetchPriceMovers();

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
        <TabBar activeFormat="price_movers" />
        <PriceMoversGrid data={data} />
      </div>
    </main>
  );
}
