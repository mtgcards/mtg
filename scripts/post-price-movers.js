'use strict';

/**
 * Generates a tweet about MTG price movers using Gemini and posts to @syowamtg.
 * Reads src/generated/price-movers.json (24h period, top 5 cards).
 * Attaches up to 4 card images via POST /1.1/media/upload.
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

async function generateTweetText(cards) {
  const cardList = cards
    .map((c, i) => {
      const change24h = c.priceChange24hr != null ? `+$${c.priceChange24hr.toFixed(2)}` : 'N/A';
      return `${i + 1}. ${c.name} (${c.rarity}) — $${c.price.toFixed(2)} (24h: ${change24h}) [${c.setName}]`;
    })
    .join('\n');

  const count = cards.length;
  const countComment =
    count <= 2 ? `今日は${count}枚だけど注目度高い！` : count >= 5 ? '今日は豊作🎴' : '';

  const prompt = [
    'あなたはMagic: The Gatheringのコモン・アンコモンカードの価格動向に詳しい',
    '日本語Xアカウント @syowamtg の中の人です。',
    '',
    '以下の24時間値上がりカードデータをもとに、MTGコレクターに刺さる',
    '魅力的なツイートを日本語で1件作成してください。',
    '',
    '【条件】',
    `- 冒頭に「今日の値上がり注目カード🔥 ${countComment}」という引きのある一文を入れる`,
    '- カード名は英語のまま、セット名（括弧内）は省略してOK',
    '- 価格と上昇額を「$5.00 → +$0.60📈」のように視覚的に表現する',
    '- 「じわじわ上がってる」「見逃せない」などの温度感のある言葉を1つ入れる',
    '- 末尾に「詳細👉 mtg.syowa.workers.dev」を入れる',
    '- ハッシュタグは「#MTG #コモンアンコモン #昭和MTG」の3つで締める',
    '- 全体で220文字以内に収める',
    '- ツイート本文のみ出力（前置き・説明文は不要）',
    '',
    '【カードデータ】',
    cardList,
  ].join('\n');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
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

async function fetchImageAsBase64(imageUrl) {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.warn(`[post-price-movers] Image fetch failed (${res.status}): ${imageUrl}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (err) {
    console.warn(`[post-price-movers] Image fetch error: ${err.message}`);
    return null;
  }
}

async function uploadMedia(base64Data) {
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
  const bodyParams = {
    media_data: base64Data,
    media_category: 'tweet_image',
  };

  // For form-encoded body, include body params in OAuth signature
  const oauthHeader = buildOAuthHeader('POST', uploadUrl, {
    media_category: 'tweet_image',
  });

  const formBody = Object.keys(bodyParams)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(bodyParams[k])}`)
    .join('&');

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: oauthHeader,
    },
    body: formBody,
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
  // Validate env vars
  const missing = ['GOOGLE_API_KEY', 'X_API_KEY', 'X_API_KEY_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_TOKEN_SECRET']
    .filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`[post-price-movers] Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Load price-movers.json
  let data;
  try {
    const raw = await readFile('src/generated/price-movers.json', 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`[post-price-movers] Failed to read price-movers.json: ${err.message}`);
    process.exit(1);
  }

  // Pick top 4 from 24h period with positive price change (max 4 images per tweet)
  const cards24h = (data['24h'] ?? []).filter((c) => (c.priceChange24hr ?? 0) > 0).slice(0, 4);

  if (cards24h.length === 0) {
    console.log('[post-price-movers] No 24h price movers found. Skipping post.');
    return;
  }

  console.log(`[post-price-movers] Top ${cards24h.length} 24h movers:`);
  cards24h.forEach((c) => console.log(`  - ${c.name}: $${c.price} (+$${c.priceChange24hr?.toFixed(2)})  image: ${c.imageUrl ?? 'none'}`));

  // Upload card images (up to 4)
  const mediaIds = [];
  for (const card of cards24h) {
    if (!card.imageUrl) {
      console.log(`[post-price-movers] No image URL for ${card.name}, skipping.`);
      continue;
    }
    console.log(`[post-price-movers] Uploading image for ${card.name}...`);
    const base64 = await fetchImageAsBase64(card.imageUrl);
    if (!base64) continue;

    const mediaId = await uploadMedia(base64);
    if (mediaId) {
      mediaIds.push(mediaId);
      console.log(`[post-price-movers] Uploaded media_id: ${mediaId}`);
    }
  }

  console.log(`[post-price-movers] ${mediaIds.length} image(s) ready.`);

  // Generate tweet via Gemini
  console.log('[post-price-movers] Generating tweet with Gemini...');
  const tweetText = await generateTweetText(cards24h);
  console.log(`[post-price-movers] Tweet:\n${tweetText}`);
  console.log(`[post-price-movers] Length: ${tweetText.length} chars`);

  if (tweetText.length > 280) {
    console.warn('[post-price-movers] Tweet exceeds 280 chars — posting anyway (X counts differently).');
  }

  // Post to X with images
  console.log(`[post-price-movers] Posting to X with ${mediaIds.length} image(s)...`);
  const result = await postTweet(tweetText, mediaIds);
  console.log(`[post-price-movers] Posted! Tweet ID: ${result?.data?.id}`);
}

main().catch((err) => {
  console.error('[post-price-movers] Fatal:', err.message);
  process.exit(1);
});
