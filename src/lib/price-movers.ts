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

export function fetchPriceMovers(): PriceMoverData {
  return data as unknown as PriceMoverData;
}
