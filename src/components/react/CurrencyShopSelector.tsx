'use client';

import { Currency, Shop } from '@/lib/types';

interface CurrencyShopSelectorProps {
  currency: Currency;
  shop: Shop;
  onCurrencyChange: (currency: Currency) => void;
  onShopChange: (shop: Shop) => void;
}

export default function CurrencyShopSelector({
  currency,
  shop,
  onCurrencyChange,
  onShopChange,
}: CurrencyShopSelectorProps) {
  return (
    <>
      <label>
        Currency:
        <select value={currency} onChange={(e) => onCurrencyChange(e.target.value as Currency)}>
          <option value="USD">$</option>
          <option value="JPY">¥</option>
          <option value="EUR">€</option>
        </select>
      </label>
      <label>
        Card Link to:
        <select value={shop} onChange={(e) => onShopChange(e.target.value as Shop)}>
          <option value="hareruya">hareruya</option>
          <option value="cardkingdom">cardkingdom</option>
          <option value="tcgplayer">tcgplayer</option>
        </select>
      </label>
    </>
  );
}
