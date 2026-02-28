interface WebSiteJsonLdProps {
  siteUrl: string;
  siteName: string;
  description?: string;
}

export function WebSiteJsonLd({ siteUrl, siteName, description }: WebSiteJsonLdProps) {
  const orgId = `${siteUrl}/#organization`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        publisher: { '@id': orgId },
      },
      {
        '@type': 'Organization',
        '@id': orgId,
        name: siteName,
        url: siteUrl,
        ...(description ? { description } : {}),
        contactPoint: {
          '@type': 'ContactPoint',
          url: `${siteUrl}/contact`,
          contactType: 'customer support',
          availableLanguage: 'Japanese',
        },
        knowsAbout: [
          'Magic: The Gathering',
          'トレーディングカードゲーム',
          'MTGカード価格',
          'パウパー',
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqJsonLdProps {
  items: FaqItem[];
}

export function FaqJsonLd({ items }: FaqJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ItemListCard {
  name: string;
  setName: string;
  rarity: string;
  imageUrl: string | null;
  priceUsd: number | null;
  priceUsdFoil: number | null;
  priceEurFoil: number | null;
}

interface ItemListJsonLdProps {
  name: string;
  url: string;
  cards: ItemListCard[];
}

export function ItemListJsonLd({ name, url, cards }: ItemListJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: cards.length,
    itemListElement: cards.map((card, index) => {
      const priceUsd = card.priceUsd ?? card.priceUsdFoil;
      const price = priceUsd ?? card.priceEurFoil;
      const currency = priceUsd !== null ? 'USD' : 'EUR';
      const shopUrl = `https://www.cardkingdom.com/catalog/search?filter%5Bname%5D=${encodeURIComponent(card.name)}`;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: card.name,
          description: `${card.setName} - ${card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)} (Magic: The Gathering)`,
          ...(card.imageUrl ? { image: card.imageUrl } : {}),
          offers: {
            '@type': 'Offer',
            price: price?.toFixed(2),
            priceCurrency: currency,
            availability: 'https://schema.org/InStock',
            url: shopUrl,
          },
        },
      };
    }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
