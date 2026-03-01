'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shop, Currency, ExchangeRates } from '@/lib/types';
import { fetchExchangeRates } from '@/lib/exchange';
import { getCardLinkUrl, convertFromUSD } from '@/lib/utils';
import { PriceMoverCard, PriceMoverData, PriceMoverPeriod } from '@/lib/price-movers';
import BackToTop from './BackToTop';

export type { PriceMoverCard, PriceMoverData, PriceMoverPeriod };

const PERIOD_LABELS: Record<PriceMoverPeriod, string> = {
  '24h': '24時間',
  '7d': '1週間',
  '30d': '1ヶ月',
  '90d': '3ヶ月',
};

const PERIOD_KEYS: PriceMoverPeriod[] = ['24h', '7d', '30d', '90d'];

function getPriceChange(card: PriceMoverCard, period: PriceMoverPeriod): number | null {
  switch (period) {
    case '24h': return card.priceChange24hr;
    case '7d':  return card.priceChange7d;
    case '30d': return card.priceChange30d;
    case '90d': return card.priceChange90d;
  }
}

interface PriceMoversGridProps {
  data: PriceMoverData;
  period: PriceMoverPeriod;
}

export default function PriceMoversGrid({ data, period }: PriceMoversGridProps) {
  const [shop, setShop] = useState<Shop>('hareruya');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ JPY: null, EUR: null });

  useEffect(() => {
    fetchExchangeRates().then(setExchangeRates);
  }, []);

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
        <label>
          Currency:
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
            <option value="USD">$</option>
            <option value="JPY">¥</option>
            <option value="EUR">€</option>
          </select>
        </label>
        <label>
          Card Link to:
          <select value={shop} onChange={(e) => setShop(e.target.value as Shop)}>
            <option value="hareruya">hareruya</option>
            <option value="cardkingdom">cardkingdom</option>
            <option value="tcgplayer">tcgplayer</option>
          </select>
        </label>
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
