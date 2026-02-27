import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import { WebSiteJsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: 'Magic: The Gatheringのコモン・アンコモンカードから高額品を年代別・セット別に展示する貴重品室です。',
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=MedievalSharp&display=swap"
          rel="stylesheet"
        />
        <WebSiteJsonLd siteUrl={SITE_URL} siteName={SITE_NAME} />
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
