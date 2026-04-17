'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { Shop, Currency, SerializedCard } from '@/lib/types';
import { useExchangeRates } from '@/lib/exchange';
import { getCardLinkUrl } from '@/lib/utils';
import { PriceMoverData, PriceMoverPeriod, PERIOD_KEYS, getPriceChange, PriceMoverCard } from '@/lib/price-movers';
import CardItem from './CardItem';
import CurrencyShopSelector from './CurrencyShopSelector';
import BackToTop from './BackToTop';

interface PriceMoversGridProps {
  data: PriceMoverData;
  period: PriceMoverPeriod;
}

/** PriceMoverCard を CardItem が受け付ける SerializedCard 形式に変換する */
function toSerializedCard(card: PriceMoverCard): SerializedCard {
  return {
    name: card.name,
    set: card.setId,
    setName: card.setName,
    rarity: card.rarity,
    releasedAt: '',
    imageUrl: card.imageUrl,
    priceUsd: card.price,
    priceUsdFoil: null,
    priceEurFoil: null,
  };
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
            <a
              key={p}
              href={`/price_movers/${p}`}
              className={`period-tab${p === period ? ' active' : ''}`}
            >
              {t(`priceMovers.periods.${p}`)}
            </a>
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
        <p className="end-message">{t('priceMovers.noResults')}</p>
      ) : (
        <div className="card-grid">
          <div className="set-section">
            <h2 className="set-title">
              {t('priceMovers.topN', { period: t(`priceMovers.periods.${period}`), count: cards.length })}
            </h2>
            <div className="set-card-grid">
              {cards.map((card, i) => (
                <CardItem
                  key={`${card.name}-${card.setId}-${i}`}
                  card={toSerializedCard(card)}
                  currency={currency}
                  shop={shop}
                  exchangeRates={exchangeRates}
                  priceChange={getPriceChange(card, period)}
                  showSetName
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <p className="end-message">{t('cards.allDisplayed')}</p>
      )}

      <BackToTop />
    </>
  );
}
