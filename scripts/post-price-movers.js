'use strict';
/**
 * Generates a tweet about MTG price movers using Gemini and posts to @syowamtg.
 * Reads src/generated/price-movers.json and randomly picks a period (24h/7d/30d/90d) and card.
 * Only posts cards released between 1995 and 2014.
 * Attaches 1 card image via POST /1.1/media/upload (v1.1).
 *
 * Required env vars:
 * GOOGLE_API_KEY, X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
 *
 * NOTE: priceChangeXxd fields from JustTCG API are PERCENTAGE values (e.g. 21.91 = +21.91%).
 * Dollar change is back-calculated as: price - price / (1 + pct/100)
 */

const { readFile } = require('node:fs/promises');
const crypto = require('node:crypto');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const X_API_KEY = process.env.X_API_KEY || '';
const X_API_KEY_SECRET = process.env.X_API_KEY_SECRET || '';
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN || '';
const X_ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET || '';

// ---- Prompt variation helpers ----
const STYLES = [
  '絵文字やユニークな表現を活用したスタイル。'
];

const URL_PREFIXES = [
  '全リストはこちら →', '昭和の懐かしコモン一覧 →', '他にも隠れたコモンいっぱい！ →',
  '詳細はこちら →', '値上がりコモン一覧 →', 'お宝コモン発見！ →',
  'もっとコモン見るなら →', '昭和のコモンリスト →', '掘り出しコモンは →',
  'サイトで全部チェック →', 'コモン市場を覗く →', '懐かしカードを探す →',
  '全コモン一覧はこちら →', '隠れたコモン続出 →', '詳しいコモンはこちら →',
  '価格チェックはこちら →', 'まだまだ眠ってるお宝 →', 'コモンのお宝を発掘！ →',
  '全セット網羅！ →', '気になるコモンを探す →', 'ほかにも高額コモンあり →',
  '昭和MTGの宝物たち →', 'お宝コモン大集合！ →', '全部見たい方はこちら →',
  'レガシーの宝庫！ →', 'アンコモンも要チェック →', 'セット別に見るならこちら →',
  '年代別に探すならこちら →', 'コレクター必見！ →',
];

// period → 日本語ラベルと値動キーのマッピング
const PERIOD_META = {
  '24h': { label: '24時間', changeKey: 'priceChange24hr' },
  '7d': { label: '7日間', changeKey: 'priceChange7d' },
  '30d': { label: '30日間', changeKey: 'priceChange30d' },
  '90d': { label: '90日間', changeKey: 'priceChange90d' },
};

// ポスト対象のリリース年範囲
const RELEASE_YEAR_MIN = 1995;
const RELEASE_YEAR_MAX = 2014;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 期間とカードをランダム選択
function pickPeriodAndCard(data) {
  const available = Object.keys(PERIOD_META).filter(
    (p) => Array.isArray(data[p]) && data[p].length > 0,
  );
  if (available.length === 0) return null;

  const shuffled = available.sort(() => Math.random() - 0.5);
  for (const period of shuffled) {
    const { changeKey } = PERIOD_META[period];
    const candidates = (data[period] ?? []).filter(
      (c) =>
        (c[changeKey] ?? 0) > 0 &&
        c.releaseYear != null &&
        c.releaseYear >= RELEASE_YEAR_MIN &&
        c.releaseYear <= RELEASE_YEAR_MAX,
    );
    if (candidates.length === 0) continue;
    const card = pickRandom(candidates);
    return { period, card };
  }
  return null;
}

// ---- Gemini ----
async function generateTweetText(card, period) {
  const { label: periodLabel, changeKey } = PERIOD_META[period];
  const pct = card[changeKey];
  const changePct = pct != null ? `+${pct.toFixed(2)}%` : 'N/A';
  const changeAbs = (pct != null && card.price != null)
    ? `+$${(card.price - card.price / (1 + pct / 100)).toFixed(2)}`
    : 'N/A';

  const cardInfo = [
    `カード名: ${card.name}`,
    `レアリティ: ${card.rarity}`,
    `セット: ${card.setName}`,
    `発売年: ${card.releaseYear}`,
    `現在値段: $${card.price.toFixed(2)}`,
    `値動(直近${periodLabel} 変化率): ${changePct}`,
    `値動(直近${periodLabel} 絶対値): ${changeAbs}`,
    card.flavorText ? `フレーバーテキスト: ${card.flavorText}` : null,
  ].filter(Boolean).join('\n');

  const style = pickRandom(STYLES);
  console.log(`[post-price-movers] Period: ${period} (${periodLabel})`);
  console.log(`[post-price-movers] Style: ${style}`);
  console.log(`[post-price-movers] changePct: ${changePct} / changeAbs: ${changeAbs}`);

  const prompt = [
    'あなたはMagic: The Gatheringのコモン・アンコモンカードの価格動向に詳しい日本語Xアカウント @syowamtg の中の人です。',
    '',
    `以下の「直近${periodLabel}値上がり」カードデータをもとに、X(旧Twitter)に投稿する日本語ツイートを1件作成してください。`,
    `「${style}」で書いてください。`,
    '',
    '【ルール】',
    '- カード名は英語のままでOK',
    `- 集計期間が「${periodLabel}」であることを自然な形で言及する`,
    '- 価格変化の表現には、提供した「変化率（例: +21.91%）」または「絶対値（例: +$1.08）」の数値をそのまま使うこと',
    '- 「○倍」「○割」などの倍率・割合表現は使わないこと',
    '- 「pic.twitter.com/」などURLは本文に一切含めないこと',
    '- ハッシュタグは #mtg と #マジックザギャザリング の2つのみ',
    '- 239文字以内に収める',
    '- ツイート本文のみ出力',
    card.flavorText ? '- フレーバーテキストを引用してもよい' : null,
    '',
    '【カードデータ】',
    cardInfo,
  ].filter(Boolean).join('\n');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 1.0 },
      }),
    },
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

// ---- OAuth 1.0a with Debug ----
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function buildOAuthHeader(method, url, bodyParams = {}) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: '1.0',
  };

  const allParams = { ...oauthParams, ...bodyParams };
  const sortedParams = Object.keys(allParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const signingKey = `${percentEncode(X_API_KEY_SECRET)}&${percentEncode(X_ACCESS_TOKEN_SECRET)}`;

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams),
  ].join('&');

  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  oauthParams.oauth_signature = signature;

  // ===== デバッグログ =====
  console.log(`[OAuth Debug] Method: ${method}`);
  console.log(`[OAuth Debug] URL: ${url}`);
  console.log(`[OAuth Debug] Base String (first 200 chars): ${baseString.substring(0, 200)}...`);
  console.log(`[OAuth Debug] Signing Key (last 8 chars): ...${signingKey.slice(-8)}`);
  // =======================

  return (
    'OAuth ' +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(', ')
  );
}

// ---- Image Fetch ----
async function fetchImageBuffer(imageUrl) {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.warn(`[post-price-movers] Image fetch failed (${res.status}): ${imageUrl}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn(`[post-price-movers] Image fetch error: ${err.message}`);
    return null;
  }
}

// ---- Media Upload (v1.1) - 現在最も安定 ----
async function uploadMedia(imageBuffer, mimeType = 'image/jpeg') {
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
  console.log(`[post-price-movers] Starting media upload to: ${uploadUrl}`);

  const oauthHeader = buildOAuthHeader('POST', uploadUrl, {});

  const form = new FormData();
  form.append('media', new Blob([imageBuffer], { type: mimeType }));
  form.append('media_category', 'tweet_image');

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: oauthHeader },
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[post-price-movers] Media upload FAILED (${res.status}): ${errBody}`);
    return null;
  }

  const json = await res.json();
  const mediaId = json.media_id_string;

  if (!mediaId) {
    console.warn(`[post-price-movers] No media_id_string in response:`, json);
    return null;
  }

  console.log(`[post-price-movers] Successfully uploaded media_id (v1.1): ${mediaId}`);
  return mediaId;
}

// ---- Post Tweet (v2) ----
async function postTweet(text, mediaIds = []) {
  const url = 'https://api.x.com/2/tweets';
  console.log(`[post-price-movers] Posting tweet to: ${url}`);

  const payload = { text };
  if (mediaIds.length > 0) {
    payload.media = { media_ids: mediaIds };
  }

  const oauthHeader = buildOAuthHeader('POST', url, {});

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: oauthHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[post-price-movers] Tweet post FAILED (${res.status}): ${errBody}`);
    throw new Error(`X API error: ${res.status} — ${errBody}`);
  }

  const json = await res.json();
  console.log(`[post-price-movers] Tweet posted successfully! ID: ${json?.data?.id}`);
  return json;
}

// ---- Main ----
async function main() {
  console.log('[post-price-movers] Script started.');

  const missing = ['GOOGLE_API_KEY', 'X_API_KEY', 'X_API_KEY_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_TOKEN_SECRET']
    .filter((k) => !process.env[k]);

  if (missing.length > 0) {
    console.error(`[post-price-movers] Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  let data;
  try {
    const raw = await readFile('src/generated/price-movers.json', 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`[post-price-movers] Failed to read price-movers.json: ${err.message}`);
    process.exit(1);
  }

  const result = pickPeriodAndCard(data);
  if (!result) {
    console.log(`[post-price-movers] No suitable cards found. Skipping post.`);
    return;
  }

  const { period, card } = result;
  console.log(`[post-price-movers] Selected period: ${period} / card: ${card.name} (${card.releaseYear})`);

  const mediaIds = [];
  if (card.imageUrl) {
    console.log(`[post-price-movers] Fetching image for ${card.name}...`);
    const imageBuffer = await fetchImageBuffer(card.imageUrl);
    if (imageBuffer) {
      console.log(`[post-price-movers] Uploading image (${imageBuffer.length} bytes)...`);
      const mediaId = await uploadMedia(imageBuffer);
      if (mediaId) {
        mediaIds.push(mediaId);
      }
    }
  }

  console.log('[post-price-movers] Generating tweet with Gemini...');
  const generatedText = await generateTweetText(card, period);

  const urlPrefix = pickRandom(URL_PREFIXES);
  const tweetText = `${generatedText}\n${urlPrefix} https://mtg.syowa.workers.dev/`;

  console.log(`[post-price-movers] Final Tweet Length: ${tweetText.length} chars`);
  console.log(`[post-price-movers] Posting to X with ${mediaIds.length} image(s)...`);

  await postTweet(tweetText, mediaIds);
}

main().catch((err) => {
  console.error('[post-price-movers] Fatal Error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});