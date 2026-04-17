'use client';

import { t } from '@/lib/i18n';
import { SerializedCard, Currency, Shop, ExchangeRates } from '@/lib/types';
import { getSetSectionId } from '@/lib/utils';
import CardItem from './CardItem';
import SetSymbol from './SetSymbol';

interface SetSectionProps {
  setName: string;
  setCode: string;
  releasedAt: string;
  cards: SerializedCard[];
  currency: Currency;
  shop: Shop;
  exchangeRates: ExchangeRates;
}

export default function SetSection({
  setName,
  setCode,
  releasedAt,
  cards,
  currency,
  shop,
  exchangeRates,
}: SetSectionProps) {
  const year = releasedAt ? t('common.year', { year: releasedAt.substring(0, 4) }) : '';
  const label = setName + (year ? ` (${year})` : '');
  const sectionId = getSetSectionId(setName);

  return (
    <section className="set-section" id={sectionId}>
      <h2 className="set-title">
        <SetSymbol setCode={setCode} />
        {label}
      </h2>
      <div className="set-card-grid">
        {cards.map((card) => (
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
  );
}
