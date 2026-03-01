import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, buildFormatMetadata } from '@/lib/constants';
import TabBar from '@/components/TabBar';
import VideoGrid from '@/components/VideoGrid';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { fetchVideos } from '@/lib/videos';

export const metadata: Metadata = buildFormatMetadata(
  '動画',
  'MTGのレガシー・ヴィンテージ・プレモダン・パウパーなどの関連動画を新着順で表示。',
  `${SITE_URL}/videos`,
);

export default function VideosPage() {
  const { videos } = fetchVideos();

  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', url: SITE_URL },
          { name: '動画', url: `${SITE_URL}/videos` },
        ]}
      />
      <div className="top-bar">
        <div className="header-compact">
          <h1>{SITE_NAME}</h1>
        </div>
        <TabBar activeFormat="videos" />
        <h2 className="page-section-title">昭和最新版MTGのYouTube動画</h2>
        <VideoGrid videos={videos} />
      </div>
    </main>
  );
}
