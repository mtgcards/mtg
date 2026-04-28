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
  '(mtg OR MTG) (レガシー OR legacy OR ヴィンテージ OR vintage OR プレモダン OR premodern OR ミドルスクール OR middleschool OR パウパー OR pauper OR 旧 OR retro OR old OR 懐かし OR 解説)';
const MAX_RESULTS = 50;
const PAGES_TO_FETCH = 3;

// 優先的に表示するチャンネルのハンドル名（@を除く）
const PRIORITY_HANDLES = [
  // 'pipomtg160',
  // 'vintage4889',
  // 'pauper9066',
  // 'yuunimtg',
  // '帽子の人',
];

const EXCLUDED_TITLE_PATTERNS = [
  /旧車.*MTG/i,
  /2スト.*MTG/i,
  /MTG\s+GOSTA/i,
  /シャコタン.*MTG/i,
  /チャリティMTG/i,
];

function isExcludedVideo(video) {
  if (!video) return false;
  return EXCLUDED_TITLE_PATTERNS.some((p) => p.test(video.title));
}

function containsJapanese(text) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]/.test(text);
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
    part: 'statistics',
    id: videoIds.join(','),
    key: API_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
  if (!res.ok) throw new Error(`Videos API error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchUploadsPlaylistId(handle) {
  const params = new URLSearchParams({
    part: 'contentDetails',
    forHandle: handle,
    key: API_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`);
  if (!res.ok) throw new Error(`Channels API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
}

async function fetchPlaylistItems(playlistId, maxResults) {
  const params = new URLSearchParams({
    part: 'snippet',
    playlistId,
    maxResults: String(maxResults),
    key: API_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
  if (!res.ok) throw new Error(`PlaylistItems API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.items || [];
}

function normalizeVideo(item, isPriority) {
  const snippet = item.snippet;
  const id = item.id?.videoId || snippet?.resourceId?.videoId;
  if (!id || !snippet) return null;
  const t = snippet.thumbnails || {};
  return {
    id,
    title: snippet.title,
    channelTitle: snippet.channelTitle,
    channelId: snippet.channelId,
    publishedAt: snippet.publishedAt,
    thumbnailUrl: t.high?.url || t.medium?.url || t.default?.url || '',
    isPriority,
  };
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

  const allItems = new Map(); // videoId -> normalized video

  // 1. 優先チャンネルの最新動画を取得
  console.log('fetch-videos: fetching priority channels …');
  for (const handle of PRIORITY_HANDLES) {
    try {
      const playlistId = await fetchUploadsPlaylistId(handle);
      if (!playlistId) {
        console.warn(`  channel handle not found: ${handle}`);
        continue;
      }
      const items = await fetchPlaylistItems(playlistId, 10);
      for (const item of items) {
        const video = normalizeVideo(item, true);
        if (video && !isExcludedVideo(video) && !allItems.has(video.id)) {
          allItems.set(video.id, video);
        }
      }
    } catch (err) {
      console.warn(`  failed to fetch priority channel ${handle}:`, err.message);
    }
  }
  console.log(`fetch-videos: ${allItems.size} videos from priority channels`);

  // 2. 通常検索
  let pageToken = null;
  for (let page = 0; page < PAGES_TO_FETCH; page++) {
    console.log(`fetch-videos: search page ${page + 1}/${PAGES_TO_FETCH} …`);

    const searchData = await fetchSearchPage(pageToken);
    const items = searchData.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      const video = normalizeVideo(item, false);
      if (video && !isExcludedVideo(video) && !allItems.has(video.id)) {
        allItems.set(video.id, video);
      }
    }

    pageToken = searchData.nextPageToken || null;
    if (!pageToken) break;
    if (page < PAGES_TO_FETCH - 1) await new Promise((r) => setTimeout(r, 500));
  }

  // 3. 日本語タイトルのみに絞り込み
  const japaneseVideos = [];
  for (const video of allItems.values()) {
    if (containsJapanese(video.title)) {
      japaneseVideos.push(video);
    }
  }
  console.log(`fetch-videos: ${japaneseVideos.length} videos after Japanese filter`);

  // 4. 詳細情報をバッチで取得
  const detailsMap = new Map();
  const ids = japaneseVideos.map((v) => v.id);
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const data = await fetchVideoDetails(batch);
    for (const v of data.items || []) {
      detailsMap.set(v.id, {
        viewCount: v.statistics?.viewCount != null ? parseInt(v.statistics.viewCount, 10) : null,
      });
    }
  }

  // 5. 最終リストを構築してソート（優先チャンネル → 公開日順）
  const allVideos = [];
  for (const video of japaneseVideos) {
    const details = detailsMap.get(video.id);
    if (!details) continue; // 削除/非公開など
    allVideos.push({
      ...video,
      viewCount: details.viewCount,
    });
  }

  allVideos.sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  const outputVideos = allVideos.map(({ isPriority, channelId, ...rest }) => rest);

  await mkdir('src/generated', { recursive: true });
  await writeFile(
    'src/generated/videos.json',
    JSON.stringify({ videos: outputVideos, fetchedAt: new Date().toISOString() }, null, 2),
  );
  console.log(`fetch-videos: saved ${outputVideos.length} videos → src/generated/videos.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
