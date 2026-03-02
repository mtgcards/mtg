import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { pageTitle } from '@/lib/constants';
import { FaqJsonLd } from '@/components/JsonLd';
import '@/styles/about.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: pageTitle(t('title')) };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tn = await getTranslations({ locale, namespace: 'nav' });

  const faqItems: { question: string; answer: string }[] = t.raw('faqItems');
  const featuresList: string[] = t.raw('featuresList');

  return (
    <main>
      <FaqJsonLd items={faqItems} />
      <div className="scroll-wrapper">
        <div className="scroll-roller top"></div>
        <div className="scroll-body">
          <h1>{t('title')}</h1>

          <h2>{t('overview')}</h2>
          <p>{t('overviewText')}</p>

          <h2>{t('features')}</h2>
          <ul>
            {featuresList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2>{t('dataSources')}</h2>
          <p>
            {t('dataSourcesCard')}
            <a href="https://scryfall.com" target="_blank" rel="noopener noreferrer">
              Scryfall
            </a>
            {t('dataSourcesCardSuffix')}
          </p>
          <p>
            {t('dataSourcesPriceMover')}
            <a href="https://justtcg.com" target="_blank" rel="noopener noreferrer">
              JustTCG
            </a>
            {t('dataSourcesPriceMoverSuffix')}
          </p>
          <p>
            {t('dataSourcesExchange')}
            <a href="https://www.frankfurter.app" target="_blank" rel="noopener noreferrer">
              Frankfurter
            </a>
            {t('dataSourcesExchangeSuffix')}
          </p>
          <p>
            {t('dataSourcesVideo')}
            <a href="https://developers.google.com/youtube/v3" target="_blank" rel="noopener noreferrer">
              YouTube Data API
            </a>
            {t('dataSourcesVideoSuffix')}
          </p>

          <h2>{t('disclaimer')}</h2>
          <p>{t('disclaimerText')}</p>

          <h2>{t('faq')}</h2>
          <dl className="faq-list">
            {faqItems.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>{item.question}</summary>
                <dd className="faq-answer">
                  {item.answer.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </dd>
              </details>
            ))}
          </dl>

          <h2>{t('operations')}</h2>
          <p>{t('operationsText')}</p>

          <h2>{t('openSource')}</h2>
          <p>
            {t('openSourceText')}
            <Link href="/contact">{tn('contact')}</Link>
            {t('openSourceSuffix')}
          </p>
          <p>
            <a
              href="https://github.com/mtgcards/mtg"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/mtgcards/mtg
            </a>
          </p>

          <Link href="/" className="back-link">
            &larr;<br />
            {tc('backToHomeScroll')}
          </Link>
        </div>
        <div className="scroll-roller bottom"></div>
      </div>
    </main>
  );
}
