import { SerializedCard, FormatKey, Currency, Shop, ExchangeRates, ThresholdKey } from './types';

export function getSetSectionId(setName: string): string {
  return 'set-' + setName.replace(/[^A-Za-z0-9]/g, '_');
}

export function getCardLinkUrl(name: string, shop: Shop): string {
  const encoded = encodeURIComponent(name);
  if (shop === 'cardkingdom') {
    return `https://www.cardkingdom.com/catalog/search?filter%5Bname%5D=${encoded}`;
  }
  if (shop === 'tcgplayer') {
    return `https://www.tcgplayer.com/search/magic/product?q=${encoded}&productLineName=magic`;
  }
  return `https://www.hareruyamtg.com/ja/products/search?product=${encoded}`;
}

export function convertFromUSD(usdAmount: number, currency: Currency, rates: ExchangeRates): string {
  if (currency === 'JPY' && rates.JPY) {
    return '¥' + Math.round(usdAmount * rates.JPY).toLocaleString('ja-JP');
  }
  if (currency === 'EUR' && rates.EUR) {
    return '€' + (usdAmount * rates.EUR).toFixed(2);
  }
  return '$' + usdAmount.toFixed(2);
}

export function formatPrice(card: SerializedCard, currency: Currency, rates: ExchangeRates): string | null {
  if (card.priceUsdFoil !== null) {
    return convertFromUSD(card.priceUsdFoil, currency, rates);
  }
  if (card.priceEurFoil !== null) {
    const eurVal = card.priceEurFoil;
    if (currency === 'JPY' && rates.EUR && rates.JPY) {
      return '¥' + Math.round((eurVal / rates.EUR) * rates.JPY).toLocaleString('ja-JP');
    }
    if (currency === 'USD' && rates.EUR) {
      return '$' + (eurVal / rates.EUR).toFixed(2);
    }
    return '€' + eurVal.toFixed(2);
  }
  if (card.priceUsd !== null) {
    return convertFromUSD(card.priceUsd, currency, rates);
  }
  return null;
}

export function filterCardsByThreshold(
  cards: SerializedCard[],
  format: FormatKey,
  thresholds: Record<ThresholdKey, number>,
): SerializedCard[] {
  return cards.filter((card) => {
    if (format === 'foil') {
      const minPrice = card.rarity === 'common'
        ? thresholds.foilCommon
        : thresholds.foilUncommon;
      const price = card.priceUsdFoil ?? card.priceEurFoil;
      return price !== null && price >= minPrice;
    }
    if (format === 'basic_land') {
      return card.priceUsd !== null && card.priceUsd >= thresholds.basicLand;
    }
    if (format === 'token') {
      return card.priceUsd !== null && card.priceUsd >= thresholds.token;
    }
    // Year-based: common/uncommon
    const minPrice = card.rarity === 'common' ? thresholds.common : thresholds.uncommon;
    return card.priceUsd !== null && card.priceUsd >= minPrice;
  });
}
