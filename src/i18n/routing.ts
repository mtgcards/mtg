import { defineRouting } from 'next-intl/routing';

export const locales = ['ja', 'en', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'ja',
});
