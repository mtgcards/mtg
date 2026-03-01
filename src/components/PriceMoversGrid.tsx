'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shop, Currency } from '@/lib/types';
import { useExchangeRates } from '@/lib/exchange';
import { getCardLinkUrl, convertFromUSD } from '@/lib/utils';
import { PriceMoverData, PriceMoverPeriod, PERIOD_KEYS, PERIOD_LABELS, getPriceChange } from '@/lib/price-movers';
import CurrencyShopSelector from './CurrencyShopSelector';
import BackToTop from './BackToTop';

interface PriceMoversGridProps {
  data: PriceMoverData;
  period: PriceMoverPeriod;
}

export default function PriceMoversGrid({ data, period }: PriceMoversGridProps) {
  const [shop, setShop] = useState<Shop>('hareruya');
  const [currency, setCurrency] = useState<Currency>('USD');
  const exchangeRates = useExchangeRates();

  const cards = data[period] ?? [];

  return (
    <>
      <div className="price-threshold-bar">
        <div className="period-tabs">
          {PERIOD_KEYS.map((p) => (
            <Link
              key={p}
              href={`/price_movers/${p}`}
              className={`period-tab${p === period ? ' active' : ''}`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </div>
        <CurrencyShopSelector
          currency={currency}
          shop={shop}
          onCurrencyChange={setCurrency}
          onShopChange={setShop}
        />
      </div>

      {cards.length === 0 ? (
        <p className="end-message">該当するカードが見つかりませんでした</p>
      ) : (
        <div className="card-grid">
          <div className="set-section">
            <h2 className="set-title">
              {PERIOD_LABELS[period]}の値上がり Top {cards.length}
            </h2>
            <div className="set-card-grid">
              {cards.map((card, i) => {
                const change = getPriceChange(card, period);
                const priceText = convertFromUSD(card.price, currency, exchangeRates);
                const href = getCardLinkUrl(card.name, shop);

                return (
                  <a
                    key={`${card.name}-${card.setId}-${i}`}
                    className={`card rarity-${card.rarity}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="card-image-wrapper">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt={card.name} loading="lazy" />
                      ) : (
                        <div className="card-image-placeholder">?</div>
                      )}
                    </div>
                    <div className="card-info">
                      <h3 className="card-name">{card.name}</h3>
                      <p className="card-set-name">{card.setName}</p>
                      <p className="card-price">{priceText}</p>
                      {change !== null && change > 0 && (
                        <p className="card-price-change positive">+{change.toFixed(1)}%</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <p className="end-message">すべてのカードを表示しました</p>
      )}

      <BackToTop />
    </>
  );
}
