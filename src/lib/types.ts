export interface ExchangeRates {
  JPY: number | null;
  EUR: number | null;
}

export type FormatKey =
  | 'y1993_2003'
  | 'y2004_2014'
  | 'y2015_2020'
  | 'y2021_2022'
  | 'y2023_2025'
  | 'y2026_'
  | 'basic_land'
  | 'token'
  | 'foil';

export type Currency = 'USD' | 'JPY' | 'EUR';

export type Shop = 'hareruya' | 'cardkingdom' | 'tcgplayer';

export interface SerializedCard {
  name: string;
  set: string;
  setName: string;
  rarity: string;
  releasedAt: string;
  imageUrl: string | null;
  priceUsd: number | null;
  priceUsdFoil: number | null;
  priceEurFoil: number | null;
}

export type ThresholdKey = 'common' | 'uncommon' | 'basicLand' | 'token' | 'foilCommon' | 'foilUncommon';
