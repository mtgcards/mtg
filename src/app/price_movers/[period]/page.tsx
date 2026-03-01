import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL, SITE_NAME, pageTitle } from '@/lib/constants';
import { fetchPriceMovers, PriceMoverPeriod } from '@/lib/price-movers';
import TabBar from '@/components/TabBar';
import PriceMoversGrid from '@/components/PriceMoversGrid';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

const PERIOD_LABELS: Record<PriceMoverPeriod, string> = {
  '24h': '24時間',
  '7d': '1週間',
  '30d': '1ヶ月',
  '90d': '3ヶ月',
};

const VALID_PERIODS: PriceMoverPeriod[] = ['24h', '7d', '30d', '90d'];

export function generateStaticParams() {
  return VALID_PERIODS.map((period) => ({ period }));
}

interface PeriodPageProps {
  params: Promise<{ period: string }>;
}

export async function generateMetadata({ params }: PeriodPageProps): Promise<Metadata> {
  const { period } = await params;

  if (!VALID_PERIODS.includes(period as PriceMoverPeriod)) return {};

  const label = `値上がり（${PERIOD_LABELS[period as PriceMoverPeriod]}）`;
  const description = `MTGのコモン・アンコモンカードで${PERIOD_LABELS[period as PriceMoverPeriod]}の値上がりが大きいカードをランキング表示。`;
  const pageUrl = `${SITE_URL}/price_movers/${period}`;

  return {
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
}

export default async function PriceMoversPeriodPage({ params }: PeriodPageProps) {
  const { period } = await params;

  if (!VALID_PERIODS.includes(period as PriceMoverPeriod)) {
    notFound();
  }

  const typedPeriod = period as PriceMoverPeriod;
  const data = fetchPriceMovers();
  const pageUrl = `${SITE_URL}/price_movers/${period}`;

  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', url: SITE_URL },
          { name: '値上がり', url: `${SITE_URL}/price_movers` },
          { name: PERIOD_LABELS[typedPeriod], url: pageUrl },
        ]}
      />
      <div className="top-bar">
        <div className="header-compact">
          <h1>{SITE_NAME}</h1>
        </div>
        <TabBar activeFormat="price_movers" />
        <PriceMoversGrid data={data} period={typedPeriod} />
      </div>
    </main>
  );
}
