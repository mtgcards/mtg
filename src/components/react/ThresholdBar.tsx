'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import {
  THRESHOLD_OPTIONS,
  THRESHOLD_VISIBILITY,
  DEFAULT_THRESHOLD_KEYS,
} from '@/lib/constants';
import { FormatKey, Currency, Shop, ThresholdKey } from '@/lib/types';
import CurrencyShopSelector from './CurrencyShopSelector';

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
  const [isOpen, setIsOpen] = useState(false);
  const visibleKeys = THRESHOLD_VISIBILITY[format] || DEFAULT_THRESHOLD_KEYS;

  return (
    <div className={`price-threshold-bar${isOpen ? ' open' : ''}`}>
      <button
        type="button"
        className="threshold-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {isOpen ? t('thresholds.toggleClose') : t('thresholds.toggleOpen')}
      </button>
      <div className="threshold-content">
        {(Object.keys(THRESHOLD_OPTIONS) as ThresholdKey[]).map((key) => {
          if (!visibleKeys.includes(key)) return null;
          const opts = THRESHOLD_OPTIONS[key];
          return (
            <label key={key}>
              {t(`thresholds.${key}`)}
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
        <CurrencyShopSelector
          currency={currency}
          shop={shop}
          onCurrencyChange={onCurrencyChange}
          onShopChange={onShopChange}
        />
      </div>
    </div>
  );
}
