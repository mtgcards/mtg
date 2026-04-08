import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/constants';
import { buildPageMetadata } from '@/lib/metadata';
import '@/styles/privacy.css';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return buildPageMetadata(t('title'), t('description'), `/${locale}/privacy`, locale);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'privacy' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const collectItems: string[] = t.raw('collectItems');
  const purposeItems: string[] = t.raw('purposeItems');
  const externalItems: string[] = t.raw('externalItems');

  return (
    <main>
      <div className="cobble-frame">
        <div className="cobble-inner">
          <h1>{t('title')}</h1>
          <p className="last-updated">{t('lastUpdated')}</p>

          <p>{t('intro')}</p>

          <h2>{t('collectTitle')}</h2>
          <p>{t('collectIntro')}</p>
          <ul>
            {collectItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2>{t('purposeTitle')}</h2>
          <p>{t('purposeIntro')}</p>
          <ul>
            {purposeItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2>{t('thirdPartyTitle')}</h2>
          <p>{t('thirdPartyText')}</p>

          <h2>{t('externalTitle')}</h2>
          <p>{t('externalIntro')}</p>
          <ul>
            {externalItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2>{t('cookieTitle')}</h2>
          <p>{t('cookieText')}</p>

          <h2>{t('analyticsTitle')}</h2>
          <p>
            {t.rich('analyticsText', {
              link: (chunks) => (
                <a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer">
                  {chunks}
                </a>
              ),
            })}
          </p>

          <h2>{t('changeTitle')}</h2>
          <p>{t('changeText')}</p>

          <h2>{t('contactTitle')}</h2>
          <p>
            {t.rich('contactText', {
              link: (chunks) => (
                <a href="https://x.com/syowamtg" target="_blank" rel="noopener noreferrer">
                  {chunks}
                </a>
              ),
            })}
          </p>

          <Link href="/" className="back-link">
            {tc('backToHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}
