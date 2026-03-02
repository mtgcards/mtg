import type { Metadata } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import Script from 'next/script';
import { Cinzel, MedievalSharp } from 'next/font/google';
import { WebSiteJsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/constants';
import '@/styles/globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const medievalSharp = MedievalSharp({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-medieval-sharp',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const siteMessages = messages.site as { name: string; description: string };

  return (
    <html lang={locale} className={`${cinzel.variable} ${medievalSharp.variable}`}>
      <head>
        <WebSiteJsonLd
          siteUrl={SITE_URL}
          siteName={siteMessages.name}
          description={siteMessages.description}
          locale={locale}
        />
      </head>
      <body>
        {children}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "66c89baf8f4d446a99046b7fc6d9689a"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
