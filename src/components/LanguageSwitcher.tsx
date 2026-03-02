'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';

const LOCALE_LABELS: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(
      { pathname },
      { locale: e.target.value as Locale },
    );
  };

  return (
    <select
      className="language-switcher"
      value={locale}
      onChange={handleChange}
      aria-label="Language"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  );
}
