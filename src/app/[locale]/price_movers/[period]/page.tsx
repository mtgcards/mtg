import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SITE_URL } from '@/lib/constants';
import { buildFormatMetadata } from '@/lib/metadata';
import { PriceMoverData, PERIOD_KEYS, isPriceMoverPeriod } from '@/lib/price-movers';
import TabBar from '@/components/TabBar';
import PriceMoversGrid from '@/components/PriceMoversGrid';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { routing } from '@/i18n/routing';

function fetchPriceMovers(): PriceMoverData {
  const filePath = path.join(process.cwd(), 'src/generated/price-movers.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as PriceMoverData;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PERIOD_KEYS.map((period) => ({ locale, period }))
  );
}

interface PeriodPageProps {
  params: Promise<{ locale: string; period: string }>;
}

export async function generateMetadata({ params }: PeriodPageProps): Promise<Metadata> {
  const { locale, period } = await params;
  if (!isPriceMoverPeriod(period)) return {};

  const t = await getTranslations({ locale, namespace: 'priceMovers.periods' });
  const tp = await getTranslations({ locale, namespace: 'priceMoversPage' });

  const periodLabel = t(period);
  const label = tp('label', { period: periodLabel });
  const description = tp('description', { period: periodLabel });
  const pageUrl = `/${locale}/price_movers/${period}`;
  return buildFormatMetadata(label, description, pageUrl, locale);
}

export default async function PriceMoversPeriodPage({ params }: PeriodPageProps) {
  const { locale, period } = await params;
  setRequestLocale(locale);
  if (!isPriceMoverPeriod(period)) notFound();

  const data = fetchPriceMovers();

  const t = await getTranslations({ locale, namespace: 'priceMovers.periods' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tp = await getTranslations({ locale, namespace: 'priceMoversPage' });
  const ts = await getTranslations({ locale, namespace: 'site' });

  const homeUrl = `${SITE_URL}/${locale}/`;
  const priceMoversUrl = `${SITE_URL}/${locale}/price_movers/7d`;
  const currentUrl = `${SITE_URL}/${locale}/price_movers/${period}`;

  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: tn('home'), url: homeUrl },
          { name: tp('breadcrumb'), url: priceMoversUrl },
          { name: t(period), url: currentUrl },
        ]}
      />
      <div className="top-bar">
        <div className="header-compact">
          <h1>{ts('name')}</h1>
        </div>
        <TabBar activeFormat="price_movers" />
        <PriceMoversGrid data={data} period={period} />
      </div>
    </main>
  );
}
