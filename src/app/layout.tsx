import type { Metadata } from 'next';
import Script from 'next/script';
import { Cinzel, MedievalSharp } from 'next/font/google';
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
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${cinzel.variable} ${medievalSharp.variable}`}>
      <head />
      <body>
        {children}
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4YKHKRGT54"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4YKHKRGT54');
          `}
        </Script>
        {/* Cloudflare Web Analytics */}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "66c89baf8f4d446a99046b7fc6d9689a"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
