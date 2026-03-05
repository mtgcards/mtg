import { SerializedCard, FormatKey, Currency, Shop, ExchangeRates, ThresholdKey } from './types';
import { ALL_FORMAT_KEYS } from './constants';

export function isFormatKey(value: string): value is FormatKey {
  return ALL_FORMAT_KEYS.includes(value as FormatKey);
}

export function getSetSectionId(setName: string): string {
  return 'set-' + setName.replace(/[^A-Za-z0-9]/g, '_');
}

export function getCardLinkUrl(name: string, shop: Shop): string {
  const encoded = encodeURIComponent(name);
  switch (shop) {
    case 'cardkingdom':
      return `https://www.cardkingdom.com/catalog/search?filter%5Bname%5D=${encoded}`;
    case 'tcgplayer':
      return `https://www.tcgplayer.com/search/magic/product?q=${encoded}&productLineName=magic`;
    default:
      return `https://www.hareruyamtg.com/ja/products/search?product=${encoded}`;
  }
}

export function convertUsdToDisplay(
  usdAmount: number,
  currency: Currency,
  rates: ExchangeRates,
): string {
  if (currency === 'JPY' && rates.JPY != null) {
    return '\u00a5' + Math.round(usdAmount * rates.JPY).toLocaleString('ja-JP');
  }
  if (currency === 'EUR' && rates.EUR != null) {
    return '\u20ac' + (usdAmount * rates.EUR).toFixed(2);
  }
  return '$' + usdAmount.toFixed(2);
}

function convertEurToDisplay(
  eurAmount: number,
  currency: Currency,
  rates: ExchangeRates,
): string {
  if (currency === 'JPY' && rates.EUR != null && rates.JPY != null) {
    return '\u00a5' + Math.round((eurAmount / rates.EUR) * rates.JPY).toLocaleString('ja-JP');
  }
  if (currency === 'USD' && rates.EUR != null) {
    return '$' + (eurAmount / rates.EUR).toFixed(2);
  }
  return '\u20ac' + eurAmount.toFixed(2);
}

/** カードの価格を表示用文字列に変換する（優先: priceUsdFoil → priceEurFoil → priceUsd） */
export function formatPrice(
  card: SerializedCard,
  currency: Currency,
  rates: ExchangeRates,
): string | null {
  if (card.priceUsdFoil != null) return convertUsdToDisplay(card.priceUsdFoil, currency, rates);
  if (card.priceEurFoil != null) return convertEurToDisplay(card.priceEurFoil, currency, rates);
  if (card.priceUsd != null) return convertUsdToDisplay(card.priceUsd, currency, rates);
  return null;
}

export function filterCardsByThreshold(
  cards: SerializedCard[],
  format: FormatKey,
  thresholds: Record<ThresholdKey, number>,
): SerializedCard[] {
  return cards.filter((card) => {
    if (format === 'foil') {
      const minPrice = card.rarity === 'common' ? thresholds.foilCommon : thresholds.foilUncommon;
      const price = card.priceUsdFoil ?? card.priceEurFoil;
      return price != null && price >= minPrice;
    }
    if (format === 'basic_land') {
      return card.priceUsd != null && card.priceUsd >= thresholds.basicLand;
    }
    if (format === 'token') {
      return card.priceUsd != null && card.priceUsd >= thresholds.token;
    }
    const minPrice = card.rarity === 'common' ? thresholds.common : thresholds.uncommon;
    return card.priceUsd != null && card.priceUsd >= minPrice;
  });
}
