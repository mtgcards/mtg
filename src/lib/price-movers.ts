import data from '@/generated/price-movers.json';

export interface PriceMoverCard {
  name: string;
  rarity: string;
  setId: string;
  setName: string;
  imageUrl: string | null;
  price: number;
  priceChange24hr: number | null;
  priceChange7d: number | null;
  priceChange30d: number | null;
  priceChange90d: number | null;
}

export type PriceMoverPeriod = '24h' | '7d' | '30d' | '90d';

export type PriceMoverData = Record<PriceMoverPeriod, PriceMoverCard[]>;

export const PERIOD_KEYS: PriceMoverPeriod[] = ['24h', '7d', '30d', '90d'];

export const PERIOD_LABELS: Record<PriceMoverPeriod, string> = {
  '24h': '24時間',
  '7d': '1週間',
  '30d': '1ヶ月',
  '90d': '3ヶ月',
};

export function getPriceChange(card: PriceMoverCard, period: PriceMoverPeriod): number | null {
  switch (period) {
    case '24h': return card.priceChange24hr;
    case '7d':  return card.priceChange7d;
    case '30d': return card.priceChange30d;
    case '90d': return card.priceChange90d;
  }
}

export function isPriceMoverPeriod(value: string): value is PriceMoverPeriod {
  return PERIOD_KEYS.includes(value as PriceMoverPeriod);
}

export function fetchPriceMovers(): PriceMoverData {
  return data as unknown as PriceMoverData;
}
