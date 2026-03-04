'use strict';

/**
 * Generates a tweet about MTG price movers using Gemini and posts to @syowamtg.
 * Reads src/generated/price-movers.json (24h period, top 1 card).
 * Attaches 1 card image via POST /1.1/media/upload.
 *
 * Required env vars:
 *   GOOGLE_API_KEY, X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
 */

const { readFile } = require('node:fs/promises');
const crypto = require('node:crypto');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const X_API_KEY = process.env.X_API_KEY || '';
const X_API_KEY_SECRET = process.env.X_API_KEY_SECRET || '';
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN || '';
const X_ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET || '';

// ---- Gemini ----

async function generateTweetText(card) {
  const change24h = card.priceChange24hr != null ? `+$${card.priceChange24hr.toFixed(2)}` : 'N/A';
  const cardInfo = `${card.name} (${card.rarity}) — $${card.price.toFixed(2)} (24h: ${change24h}) [${card.setName}]`;

  const prompt = [
    'あなたはMagic: The Gatheringのコモン・アンコモンカードの価格動向に詳しい',
    '日本語Xアカウント @syowamtg の中の人です。',
    '',
    '以下の24時間値上がりカードデータをもとに、MTGコレクターに刺さる',
    '魅力的なツイートを日本語で1件作成してください。',
    '',
    '【条件】',
    '- 冒頭に「🔥 今日の注目値上がりカード」という引きのある一文を入れる',
    '- カード名は英語のまま、セット名（括弧内）は省略してOK',
    '- 価格と上昇額を「$5.00 → +$0.60📈」のように視覚的に表現する',
    '- 「じわじわ上がってる」「見逃せない」などの温度感のある言葉を1つ入れる',
    '- 末尾に「詳細👉 mtg.syowa.workers.dev」を入れる',
    '- ハッシュタグは「#昭和MTG」で締める',
    '- 全体で220文字以内に収める',
    '- ツイート本文のみ出力（前置き・説明文は不要）',
    '',
    '【カードデータ】',
    cardInfo,
  ].join('\n');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.9 },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error: ${res.status} — ${body}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

// ---- OAuth 1.0a ----

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function buildOAuthHeader(method, url, bodyParams) {
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

  return (
    'OAuth ' +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(', ')
  );
}

// ---- Media Upload (v1.1) ----
// OAuth署名には media_data を含めない。
// 常識的に、巨大なバイナリデータはOAuth署名パラメータから除外し、
// Content-Type: multipart/form-data で送信する。

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

async function uploadMedia(imageBuffer, mimeType = 'image/jpeg') {
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';

  // OAuth署名にはボディパラメータを一切含めない（multipartのため）
  const oauthHeader = buildOAuthHeader('POST', uploadUrl, {});

  // multipart/form-data で送信
  const FormData = (await import('node:buffer')).Blob ? globalThis.FormData : null;

  // Node 18+のネイティブ FormData を使用
  const form = new FormData();
  form.append('media', new Blob([imageBuffer], { type: mimeType }));
  form.append('media_category', 'tweet_image');

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: oauthHeader,
      // Content-Type は FormData が自動設定するので指定不要
    },
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn(`[post-price-movers] Media upload failed (${res.status}): ${errBody}`);
    return null;
  }

  const json = await res.json();
  return json.media_id_string ?? null;
}

// ---- Post Tweet (v2) ----

async function postTweet(text, mediaIds = []) {
  const url = 'https://api.twitter.com/2/tweets';

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
    throw new Error(`X API error: ${res.status} — ${errBody}`);
  }

  return res.json();
}

// ---- Main ----

async function main() {
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

  const card = (data['24h'] ?? []).find((c) => (c.priceChange24hr ?? 0) > 0);

  if (!card) {
    console.log('[post-price-movers] No 24h price movers found. Skipping post.');
    return;
  }

  console.log(`[post-price-movers] Top card: ${card.name}: $${card.price} (+$${card.priceChange24hr?.toFixed(2)})  image: ${card.imageUrl ?? 'none'}`);

  // Upload card image via multipart/form-data
  const mediaIds = [];
  if (card.imageUrl) {
    console.log(`[post-price-movers] Fetching image for ${card.name}...`);
    const imageBuffer = await fetchImageBuffer(card.imageUrl);
    if (imageBuffer) {
      console.log(`[post-price-movers] Uploading image (${imageBuffer.length} bytes)...`);
      const mediaId = await uploadMedia(imageBuffer);
      if (mediaId) {
        mediaIds.push(mediaId);
        console.log(`[post-price-movers] Uploaded media_id: ${mediaId}`);
      }
    }
  } else {
    console.log(`[post-price-movers] No image URL for ${card.name}, posting without image.`);
  }

  console.log('[post-price-movers] Generating tweet with Gemini...');
  const tweetText = await generateTweetText(card);
  console.log(`[post-price-movers] Tweet:\n${tweetText}`);
  console.log(`[post-price-movers] Length: ${tweetText.length} chars`);

  if (tweetText.length > 280) {
    console.warn('[post-price-movers] Tweet exceeds 280 chars — posting anyway (X counts differently).');
  }

  console.log(`[post-price-movers] Posting to X with ${mediaIds.length} image(s)...`);
  const result = await postTweet(tweetText, mediaIds);
  console.log(`[post-price-movers] Posted! Tweet ID: ${result?.data?.id}`);
}

main().catch((err) => {
  console.error('[post-price-movers] Fatal:', err.message);
  process.exit(1);
});
