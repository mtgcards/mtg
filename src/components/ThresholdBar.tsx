'use client';

import {
  THRESHOLD_OPTIONS,
  THRESHOLD_VISIBILITY,
  DEFAULT_THRESHOLD_KEYS,
  THRESHOLD_LABELS,
} from '@/lib/constants';
import { FormatKey, Currency, Shop, ThresholdKey } from '@/lib/types';

interface ThresholdBarProps {
  format: FormatKey;
  thresholds: Record<ThresholdKey, number>;
  currency: Currency;
  shop: Shop;
  onThresholdChange: (key: ThresholdKey, value: number) => void;
  onCurrencyChange: (currency: Currency) => void;
  onShopChange: (shop: Shop) => void;
}

export default function ThresholdBar({
  format,
  thresholds,
  currency,
  shop,
  onThresholdChange,
  onCurrencyChange,
  onShopChange,
}: ThresholdBarProps) {
  const visibleKeys = THRESHOLD_VISIBILITY[format] || DEFAULT_THRESHOLD_KEYS;

  return (
    <div className="price-threshold-bar">
      {(Object.keys(THRESHOLD_OPTIONS) as ThresholdKey[]).map((key) => {
        if (!visibleKeys.includes(key)) return null;
        const opts = THRESHOLD_OPTIONS[key];
        return (
          <label key={key}>
            {THRESHOLD_LABELS[key]}
            <select
              value={thresholds[key]}
              onChange={(e) => onThresholdChange(key, parseFloat(e.target.value))}
            >
              {opts.values.map((v) => (
                <option key={v} value={v}>
                  ${v.toFixed(2)}
                </option>
              ))}
            </select>
          </label>
        );
      })}
      <label>
        Currency:
        <select value={currency} onChange={(e) => onCurrencyChange(e.target.value as Currency)}>
          <option value="USD">$</option>
          <option value="JPY">¥</option>
          <option value="EUR">€</option>
        </select>
      </label>
      <label>
        Card Link:
        <select value={shop} onChange={(e) => onShopChange(e.target.value as Shop)}>
          <option value="hareruya">hareruya</option>
          <option value="cardkingdom">cardkingdom</option>
          <option value="tcgplayer">tcgplayer</option>
        </select>
      </label>
    </div>
  );
}
