import type { Metadata } from 'next';
import Script from 'next/script';
import { Cinzel, MedievalSharp } from 'next/font/google';
import Footer from '@/components/Footer';
import { WebSiteJsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
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
  title: SITE_NAME,
  description: 'Magic: The Gatheringのコモン・アンコモンカードから高額品を年代別・セット別に展示する貴重品室です。',
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${cinzel.variable} ${medievalSharp.variable}`}>
      <head>
        <WebSiteJsonLd
          siteUrl={SITE_URL}
          siteName={SITE_NAME}
          description="Magic: The Gatheringのコモン・アンコモンカードから高額品を年代別・セット別に展示する貴重品室です。"
        />
      </head>
      <body>
        {children}
        <Footer />
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "66c89baf8f4d446a99046b7fc6d9689a"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
