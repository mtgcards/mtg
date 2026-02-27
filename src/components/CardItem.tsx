'use client';

import { SerializedCard, Currency, Shop, ExchangeRates } from '@/lib/types';
import { getCardLinkUrl, formatPrice } from '@/lib/utils';

interface CardItemProps {
  card: SerializedCard;
  currency: Currency;
  shop: Shop;
  exchangeRates: ExchangeRates;
}

export default function CardItem({ card, currency, shop, exchangeRates }: CardItemProps) {
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
        <p className={priceText ? 'card-price' : 'card-price unavailable'}>
          {priceText || '価格情報なし'}
        </p>
      </div>
    </a>
  );
}
