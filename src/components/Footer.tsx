import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Footer() {
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');

  return (
    <footer>
      <p>
        {t('dataProvider')}
        <a href="https://scryfall.com" target="_blank" rel="noopener noreferrer">
          Scryfall
        </a>
      </p>
      <nav className="footer-nav">
        <Link href="/about">{tn('about')}</Link>
        <a href="https://x.com/syowamtg" target="_blank" rel="noopener noreferrer">
          {tn('contact')}
        </a>
        <Link href="/privacy">{tn('privacy')}</Link>
        <LanguageSwitcher />
      </nav>
    </footer>
  );
}
