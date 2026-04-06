import { MetadataRoute } from 'next';
import { ALL_FORMAT_KEYS, SITE_URL, DEFAULT_FORMAT } from '@/lib/constants';
import { locales } from '@/i18n/routing';

export const dynamic = 'force-static';

const PRICE_MOVER_PERIODS = ['24h', '7d', '30d', '90d'] as const;

function localeUrls(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'],
  lastModified: Date,
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    changeFrequency,
    priority,
    lastModified,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  const homeUrls = localeUrls('', 1.0, 'weekly', buildDate);

  const formatUrls = ALL_FORMAT_KEYS
    .filter((key) => key !== DEFAULT_FORMAT)
    .flatMap((key) => localeUrls(`/${key}`, 0.8, 'daily', buildDate));

  const priceMoverIndexUrls = localeUrls('/price_movers', 0.7, 'daily', buildDate);

  const priceMoverUrls = PRICE_MOVER_PERIODS.flatMap((period) =>
    localeUrls(`/price_movers/${period}`, 0.7, 'daily', buildDate),
  );

  const videoUrls = localeUrls('/videos', 0.7, 'daily', buildDate);
  const aboutUrls = localeUrls('/about', 0.5, 'monthly', buildDate);
  const contactUrls = localeUrls('/contact', 0.5, 'monthly', buildDate);
  const privacyUrls = localeUrls('/privacy', 0.3, 'monthly', buildDate);

  return [
    ...homeUrls,
    ...formatUrls,
    ...priceMoverIndexUrls,
    ...priceMoverUrls,
    ...videoUrls,
    ...aboutUrls,
    ...contactUrls,
    ...privacyUrls,
  ];
}
