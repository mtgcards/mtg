import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/constants';
import { buildPageMetadata } from '@/lib/metadata';
import ContactForm from '@/components/ContactForm';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return buildPageMetadata(t('title'), t('description'), `/${locale}/contact`, locale);
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contact' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <main>
      <div className="static-page">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
        <ContactForm />
        <Link href="/" className="back-link">
          {tc('backToHome')}
        </Link>
      </div>
    </main>
  );
}
