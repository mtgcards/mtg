import { SITE_URL } from '@/lib/constants';
import type { PriceMoverData, PriceMoverPeriod, PriceMoverCard } from '@/lib/price-movers';
import { getPriceChange } from '@/lib/price-movers';
import priceMoversData from '@/generated/price-movers.json';

export const dynamic = 'force-static';

const PERIOD_LABELS: Record<PriceMoverPeriod, string> = {
  '24h': '24時間',
  '7d': '1週間',
  '30d': '1ヶ月',
  '90d': '3ヶ月',
};


function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRfc2822(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const tzOffset = -date.getTimezoneOffset();
  const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, '0');
  const tzSign = tzOffset >= 0 ? '+' : '-';

  return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} ${tzSign}${tzHours}${tzMinutes}`;
}

function generateRssItem(
  card: PriceMoverCard,
  period: PriceMoverPeriod,
  index: number,
  pubDate: string,
): string {
  const changePercent = getPriceChange(card, period);
  if (changePercent === null) return '';
  const changeSign = changePercent >= 0 ? '+' : '';

  const title = `${card.name} (${PERIOD_LABELS[period]}: ${changeSign}${changePercent}%)`;
  const link = `${SITE_URL}/ja/price_movers/${period}`;
  const guid = `${card.name}-${card.setId}-${period}-${index}`;
  const description = `${card.name} (${card.rarity}) - ${card.setName} : $${card.price} (${changeSign}${changePercent}%)`;

  return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <description>${escapeXml(description)}</description>
    </item>`;
}

export async function GET(): Promise<Response> {
  const data = priceMoversData as PriceMoverData;
  const buildDate = new Date();
  const pubDate = formatRfc2822(buildDate);

  const periods: PriceMoverPeriod[] = ['24h', '7d', '30d', '90d'];
  let items = '';

  for (const period of periods) {
    const cards = data[period] ?? [];
    // 各期間の上位10カードを含める
    const topCards = cards.slice(0, 10);

    for (let i = 0; i < topCards.length; i++) {
      items += generateRssItem(topCards[i], period, i, pubDate);
    }
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml('昭和MTG 高額コモン&アンコモン貴重品室 - 値上がりカード')}</title>
    <link>${SITE_URL}/ja/price_movers</link>
    <description>MTGコモン・アンコモンの値上がりカード情報</description>
    <language>ja</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
