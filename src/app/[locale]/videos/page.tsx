import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SITE_URL } from '@/lib/constants';
import { buildFormatMetadata } from '@/lib/metadata';
import TabBar from '@/components/TabBar';
import VideoGrid from '@/components/VideoGrid';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { fetchVideos } from '@/lib/videos';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'videosPage' });
  return buildFormatMetadata(t('label'), t('description'), `/${locale}/videos`, locale);
}

export default async function VideosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { videos } = fetchVideos();

  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tv = await getTranslations({ locale, namespace: 'videos' });
  const ts = await getTranslations({ locale, namespace: 'site' });
  const tvp = await getTranslations({ locale, namespace: 'videosPage' });

  const homeUrl = `${SITE_URL}/${locale}/`;
  const videosUrl = `${SITE_URL}/${locale}/videos`;

  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: tn('home'), url: homeUrl },
          { name: tvp('label'), url: videosUrl },
        ]}
      />
      <div className="top-bar">
        <div className="header-compact">
          <h1>{ts('name')}</h1>
        </div>
        <TabBar activeFormat="videos" />
        <h2 className="page-section-title">{tv('sectionTitle')}</h2>
        <VideoGrid videos={videos} />
      </div>
    </main>
  );
}
