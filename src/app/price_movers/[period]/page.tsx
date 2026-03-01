import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL, SITE_NAME, buildFormatMetadata } from '@/lib/constants';
import { fetchPriceMovers, PriceMoverPeriod, PERIOD_KEYS, PERIOD_LABELS, isPriceMoverPeriod } from '@/lib/price-movers';
import TabBar from '@/components/TabBar';
import PriceMoversGrid from '@/components/PriceMoversGrid';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export function generateStaticParams() {
  return PERIOD_KEYS.map((period) => ({ period }));
}

interface PeriodPageProps {
  params: Promise<{ period: string }>;
}

export async function generateMetadata({ params }: PeriodPageProps): Promise<Metadata> {
  const { period } = await params;
  if (!isPriceMoverPeriod(period)) return {};

  const label = `値上がり（${PERIOD_LABELS[period]}）`;
  const description = `MTGのコモン・アンコモンカードで${PERIOD_LABELS[period]}の値上がりが大きいカードをランキング表示。`;
  const pageUrl = `${SITE_URL}/price_movers/${period}`;
  return buildFormatMetadata(label, description, pageUrl);
}

export default async function PriceMoversPeriodPage({ params }: PeriodPageProps) {
  const { period } = await params;
  if (!isPriceMoverPeriod(period)) notFound();

  const data = fetchPriceMovers();
  const pageUrl = `${SITE_URL}/price_movers/${period}`;

  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', url: SITE_URL },
          { name: '値上がり', url: `${SITE_URL}/price_movers/7d` },
          { name: PERIOD_LABELS[period], url: pageUrl },
        ]}
      />
      <div className="top-bar">
        <div className="header-compact">
          <h1>{SITE_NAME}</h1>
        </div>
        <TabBar activeFormat="price_movers" />
        <PriceMoversGrid data={data} period={period} />
      </div>
    </main>
  );
}
