'use client';

import { useTranslations } from 'next-intl';
import { SerializedCard, Currency, Shop, ExchangeRates } from '@/lib/types';
import { getCardLinkUrl, formatPrice } from '@/lib/utils';

interface CardItemProps {
  card: SerializedCard;
  currency: Currency;
  shop: Shop;
  exchangeRates: ExchangeRates;
  /** 価格変動率(%)。指定時に表示する */
  priceChange?: number | null;
  /** セット名を表示するか */
  showSetName?: boolean;
}

export default function CardItem({
  card,
  currency,
  shop,
  exchangeRates,
  priceChange,
  showSetName = false,
}: CardItemProps) {
  const t = useTranslations('cards');
  const priceText = formatPrice(card, currency, exchangeRates);
  const href = getCardLinkUrl(card.name, shop);

  return (
    <a
      className={`card rarity-${card.rarity}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="card-image-wrapper">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            loading="lazy"
          />
        ) : (
          <div className="card-image-placeholder">🃏</div>
        )}
      </div>
      <div className="card-info">
        <h3 className="card-name">{card.name}</h3>
        {showSetName && <p className="card-set-name">{card.setName}</p>}
        <p className={priceText ? 'card-price' : 'card-price unavailable'}>
          {priceText || t('noPrice')}
        </p>
        {priceChange != null && priceChange > 0 && (
          <p className="card-price-change positive">+{priceChange.toFixed(1)}%</p>
        )}
      </div>
    </a>
  );
}
