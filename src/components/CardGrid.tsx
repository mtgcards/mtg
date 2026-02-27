'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { SerializedCard, FormatKey, Currency, Shop, ExchangeRates, ThresholdKey } from '@/lib/types';
import { THRESHOLD_OPTIONS } from '@/lib/constants';
import { fetchExchangeRates } from '@/lib/exchange';
import { getSetSectionId, filterCardsByThreshold } from '@/lib/utils';
import ThresholdBar from './ThresholdBar';
import SetSection from './SetSection';
import BackToTop from './BackToTop';

interface CardGridProps {
  cards: SerializedCard[];
  format: FormatKey;
}

interface SetGroup {
  setName: string;
  setCode: string;
  releasedAt: string;
  cards: SerializedCard[];
}

function groupBySet(cards: SerializedCard[]): SetGroup[] {
  const map = new Map<string, SetGroup>();
  for (const card of cards) {
    const key = card.setName;
    if (!map.has(key)) {
      map.set(key, {
        setName: card.setName,
        setCode: card.set,
        releasedAt: card.releasedAt,
        cards: [],
      });
    }
    map.get(key)!.cards.push(card);
  }
  const groups = Array.from(map.values());
  groups.sort((a, b) => (a.releasedAt || '').localeCompare(b.releasedAt || ''));
  return groups;
}

function getDefaultThresholds(): Record<ThresholdKey, number> {
  const result = {} as Record<ThresholdKey, number>;
  for (const key of Object.keys(THRESHOLD_OPTIONS) as ThresholdKey[]) {
    result[key] = THRESHOLD_OPTIONS[key].default;
  }
  return result;
}

export default function CardGrid({ cards, format }: CardGridProps) {
  const [thresholds, setThresholds] = useState<Record<ThresholdKey, number>>(getDefaultThresholds);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [shop, setShop] = useState<Shop>('hareruya');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ JPY: null, EUR: null });

  useEffect(() => {
    fetchExchangeRates().then(setExchangeRates);
  }, []);

  const handleThresholdChange = useCallback((key: ThresholdKey, value: number) => {
    setThresholds((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filteredCards = useMemo(
    () => filterCardsByThreshold(cards, format, thresholds),
    [cards, format, thresholds],
  );

  const setGroups = useMemo(() => groupBySet(filteredCards), [filteredCards]);

  const setNavLinks = useMemo(
    () =>
      setGroups.map((g) => ({
        id: getSetSectionId(g.setName),
        setName: g.setName,
        setCode: g.setCode,
      })),
    [setGroups],
  );

  return (
    <>
      <ThresholdBar
        format={format}
        thresholds={thresholds}
        currency={currency}
        shop={shop}
        onThresholdChange={handleThresholdChange}
        onCurrencyChange={setCurrency}
        onShopChange={setShop}
      />

      {setNavLinks.length > 0 && (
        <nav className="set-nav">
          {setNavLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="set-nav-link">
              {link.setCode && (
                <img
                  src={`https://svgs.scryfall.io/sets/${link.setCode}.svg`}
                  alt=""
                  className="set-symbol"
                />
              )}
              <span className="set-nav-text">{link.setName}</span>
            </a>
          ))}
        </nav>
      )}

      <div className="card-grid">
        {setGroups.map((group) => (
          <SetSection
            key={group.setName}
            setName={group.setName}
            setCode={group.setCode}
            releasedAt={group.releasedAt}
            cards={group.cards}
            currency={currency}
            shop={shop}
            exchangeRates={exchangeRates}
          />
        ))}
      </div>

      {filteredCards.length > 0 && (
        <p className="end-message">すべてのカードを表示しました</p>
      )}

      <BackToTop />
    </>
  );
}
