import { MetadataRoute } from 'next';
import { ALL_FORMAT_KEYS, SITE_URL, DEFAULT_FORMAT } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const formatUrls: MetadataRoute.Sitemap = ALL_FORMAT_KEYS
    .filter((key) => key !== DEFAULT_FORMAT)
    .map((key) => ({
      url: `${SITE_URL}/${key}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...formatUrls,
  ];
}
