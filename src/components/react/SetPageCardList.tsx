'use client';

import { useState, useMemo, useCallback } from 'react';
import { t } from '@/lib/i18n';
import { SerializedCard, Currency, Shop, ThresholdKey } from '@/lib/types';
import { DEFAULT_THRESHOLDS } from '@/lib/constants';
import { useExchangeRates } from '@/lib/exchange';
import ThresholdBar from './ThresholdBar';
import CardItem from './CardItem';
import SetSymbol from './SetSymbol';
import BackToTop from './BackToTop';

interface SetPageCardListProps {
  setName: string;
  setCode: string;
  releasedAt: string;
  cards: SerializedCard[];
}

interface CardGroup {
  key: string;
  label: string;
  cards: SerializedCard[];
}

function deduplicateCards(cards: SerializedCard[]): SerializedCard[] {
  const seen = new Set<string>();
  const result: SerializedCard[] = [];
  for (const card of cards) {
    const isFoil = card.priceUsdFoil != null || card.priceEurFoil != null;
    const key = `${card.name}|${card.set}|${card.imageUrl ?? ''}|${isFoil ? 'foil' : 'normal'}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(card);
    }
  }
  return result;
}

function filterCardsForSetPage(
  cards: SerializedCard[],
  thresholds: Record<ThresholdKey, number>,
): SerializedCard[] {
  return cards.filter((card) => {
    if (card.rarity === 'basic') {
      return card.priceUsd != null && card.priceUsd >= thresholds.basicLand;
    }
    if (card.rarity === 'token') {
      return card.priceUsd != null && card.priceUsd >= thresholds.token;
    }
    if (card.priceUsdFoil != null || card.priceEurFoil != null) {
      const minPrice = card.rarity === 'common' ? thresholds.foilCommon : thresholds.foilUncommon;
      const price = card.priceUsdFoil ?? card.priceEurFoil;
      return price != null && price >= minPrice;
    }
    const minPrice = card.rarity === 'common' ? thresholds.common : thresholds.uncommon;
    return card.priceUsd != null && card.priceUsd >= minPrice;
  });
}

function groupByCategory(cards: SerializedCard[], setName: string): CardGroup[] {
  const basic: SerializedCard[] = [];
  const token: SerializedCard[] = [];
  const foil: SerializedCard[] = [];
  const uncommon: SerializedCard[] = [];
  const common: SerializedCard[] = [];

  for (const card of cards) {
    if (card.rarity === 'basic') {
      basic.push(card);
    } else if (card.rarity === 'token') {
      token.push(card);
    } else if (card.priceUsdFoil != null || card.priceEurFoil != null) {
      foil.push(card);
    } else if (card.rarity === 'uncommon') {
      uncommon.push(card);
    } else if (card.rarity === 'common') {
      common.push(card);
    }
  }

  const groups: CardGroup[] = [];
  if (common.length > 0) groups.push({ key: 'common', label: t('setPage.common', { setName }), cards: common });
  if (uncommon.length > 0) groups.push({ key: 'uncommon', label: t('setPage.uncommon', { setName }), cards: uncommon });
  if (basic.length > 0) groups.push({ key: 'basic', label: t('setPage.basicLand', { setName }), cards: basic });
  if (token.length > 0) groups.push({ key: 'token', label: t('setPage.token', { setName }), cards: token });
  if (foil.length > 0) groups.push({ key: 'foil', label: t('setPage.foil', { setName }), cards: foil });

  return groups;
}

export default function SetPageCardList({ setName, setCode, releasedAt, cards }: SetPageCardListProps) {
  const [thresholds, setThresholds] = useState<Record<ThresholdKey, number>>(() => ({ ...DEFAULT_THRESHOLDS }));
  const [currency, setCurrency] = useState<Currency>('USD');
  const [shop, setShop] = useState<Shop>('hareruya');
  const exchangeRates = useExchangeRates();

  const handleThresholdChange = useCallback((key: ThresholdKey, value: number) => {
    setThresholds((prev) => ({ ...prev, [key]: value }));
  }, []);

  const uniqueCards = useMemo(() => deduplicateCards(cards), [cards]);
  const filteredCards = useMemo(
    () => filterCardsForSetPage(uniqueCards, thresholds),
    [uniqueCards, thresholds],
  );
  const groups = useMemo(() => groupByCategory(filteredCards, setName), [filteredCards, setName]);
  const year = releasedAt ? t('common.year', { year: releasedAt.substring(0, 4) }) : '';

  return (
    <>
      <div className="set-page-header">
        <div className="set-page-title-wrap">
          <SetSymbol setCode={setCode} />
          <h1 className="set-page-title">
            {setName}
            {year && <span className="set-page-year">（{year}）</span>}
          </h1>
        </div>
      </div>

      <ThresholdBar
        visibleKeys={['common', 'uncommon']}
        thresholds={thresholds}
        currency={currency}
        shop={shop}
        onThresholdChange={handleThresholdChange}
        onCurrencyChange={setCurrency}
        onShopChange={setShop}
      />

      {groups.length === 0 ? (
        <p className="no-cards-message">{t('setPage.noCards')}</p>
      ) : (
        <div className="set-page-groups">
          {groups.map((group) => (
            <section key={group.key} className="set-page-group">
              <h2 className="set-page-group-title">{group.label}</h2>
              <div className="set-card-grid">
                {group.cards.map((card) => (
                  <CardItem
                    key={`${card.name}-${card.set}-${card.imageUrl ?? ''}`}
                    card={card}
                    currency={currency}
                    shop={shop}
                    exchangeRates={exchangeRates}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BackToTop />
    </>
  );
}
