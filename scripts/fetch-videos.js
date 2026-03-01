'use strict';

/**
 * Prebuild script: fetches YouTube videos and writes to
 * src/generated/videos.json before `next build` runs.
 *
 * Usage: node scripts/fetch-videos.js
 * (automatically invoked via npm's `prebuild` lifecycle hook)
 */

const { existsSync } = require('node:fs');
const { mkdir, writeFile } = require('node:fs/promises');

const API_KEY = process.env.YOUTUBE_API_KEY || '';
const SEARCH_QUERY =
  '(mtg OR MTG) (レガシー OR legacy OR ヴィンテージ OR vintage OR プレモダン OR premodern OR ミドルスクール OR middleschool OR パウパー OR pauper OR 旧枠 OR retro OR old)';
const MAX_RESULTS = 50;
const PAGES_TO_FETCH = 3;
const MIN_DURATION_SECONDS = 60; // ショート動画を除外（1分以下）

function parseDurationSeconds(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}

async function fetchSearchPage(pageToken) {
  const params = new URLSearchParams({
    part: 'snippet',
    q: SEARCH_QUERY,
    type: 'video',
    order: 'date',
    maxResults: String(MAX_RESULTS),
    key: API_KEY,
    relevanceLanguage: 'ja',
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error(`Search API error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchVideoDetails(videoIds) {
  const params = new URLSearchParams({
    part: 'contentDetails,statistics',
    id: videoIds.join(','),
    key: API_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
  if (!res.ok) throw new Error(`Videos API error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!API_KEY) {
    if (existsSync('src/generated/videos.json')) {
      console.warn('YOUTUBE_API_KEY not set — keeping existing cache');
    } else {
      console.warn('YOUTUBE_API_KEY not set — writing empty videos.json');
      await mkdir('src/generated', { recursive: true });
      await writeFile(
        'src/generated/videos.json',
        JSON.stringify({ videos: [], fetchedAt: new Date().toISOString() }),
      );
    }
    return;
  }

  const allVideos = [];
  let pageToken = null;

  for (let page = 0; page < PAGES_TO_FETCH; page++) {
    console.log(`fetch-videos: page ${page + 1}/${PAGES_TO_FETCH} …`);

    const searchData = await fetchSearchPage(pageToken);
    const items = searchData.items || [];
    if (items.length === 0) break;

    const videoIds = items.map((item) => item.id.videoId).filter(Boolean);
    const detailsData = await fetchVideoDetails(videoIds);

    const detailsMap = new Map();
    for (const v of detailsData.items || []) {
      detailsMap.set(v.id, {
        durationSeconds: parseDurationSeconds(v.contentDetails?.duration || ''),
        viewCount: v.statistics?.viewCount != null ? parseInt(v.statistics.viewCount, 10) : null,
      });
    }

    for (const item of items) {
      const id = item.id.videoId;
      const details = detailsMap.get(id);
      if (!details || details.durationSeconds <= MIN_DURATION_SECONDS) continue;

      const { snippet } = item;
      const t = snippet.thumbnails || {};
      allVideos.push({
        id,
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        thumbnailUrl: t.high?.url || t.medium?.url || t.default?.url || '',
        viewCount: details.viewCount,
      });
    }

    pageToken = searchData.nextPageToken || null;
    if (!pageToken) break;

    if (page < PAGES_TO_FETCH - 1) await new Promise((r) => setTimeout(r, 500));
  }

  await mkdir('src/generated', { recursive: true });
  await writeFile(
    'src/generated/videos.json',
    JSON.stringify({ videos: allVideos, fetchedAt: new Date().toISOString() }, null, 2),
  );
  console.log(`fetch-videos: saved ${allVideos.length} videos → src/generated/videos.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
