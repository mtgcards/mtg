import { MetadataRoute } from 'next';
import { ALL_FORMAT_KEYS, SITE_URL, DEFAULT_FORMAT } from '@/lib/constants';

const PRICE_MOVER_PERIODS = ['24h', '7d', '30d', '90d'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const formatUrls: MetadataRoute.Sitemap = ALL_FORMAT_KEYS
    .filter((key) => key !== DEFAULT_FORMAT)
    .map((key) => ({
      url: `${SITE_URL}/${key}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const priceMoverUrls: MetadataRoute.Sitemap = PRICE_MOVER_PERIODS.map((period) => ({
    url: `${SITE_URL}/price_movers/${period}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...formatUrls,
    ...priceMoverUrls,
  ];
}
