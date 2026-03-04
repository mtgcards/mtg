'use strict';

/**
 * Generates a tweet about MTG price movers using Gemini and posts to @syowamtg.
 * Reads src/generated/price-movers.json (24h period, top 5 cards).
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

  const prompt = [
    'あなたはMagic: The Gatheringの価格情報を発信するXアカウント @syowamtg の中の人です。',
    '以下の24時間値上がりカードTOP5の情報をもとに、Xに投稿するツイート文を日本語で1件作成してください。',
    '',
    '【条件】',
    '- 200文字以内（ハッシュタグと絵文字含む）',
    '- 冒頭に「📈 値上がりコモンアンコモンカード」と書く',
    '- カード名・価格・上昇額を簡潔に列挙する',
    '- 末尾に「#昭和MTG」を付ける',
    '- URLは含めない',
    '- ツイート本文のみ出力（前置きや説明は不要）',
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

  // Collect all params for signature base string
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

  const headerValue =
    'OAuth ' +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(', ');

  return headerValue;
}

async function postTweet(text) {
  const url = 'https://api.twitter.com/2/tweets';
  const body = JSON.stringify({ text });

  // For JSON body, OAuth signature uses empty params (body is not form-encoded)
  const oauthHeader = buildOAuthHeader('POST', url, {});

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: oauthHeader,
    },
    body,
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

  // Pick top 5 from 24h period with positive price change
  const cards24h = (data['24h'] ?? []).filter((c) => (c.priceChange24hr ?? 0) > 0).slice(0, 5);

  if (cards24h.length === 0) {
    console.log('[post-price-movers] No 24h price movers found. Skipping post.');
    return;
  }

  console.log(`[post-price-movers] Top ${cards24h.length} 24h movers:`);
  cards24h.forEach((c) => console.log(`  - ${c.name}: $${c.price} (+$${c.priceChange24hr?.toFixed(2)})`))

  // Generate tweet via Gemini
  console.log('[post-price-movers] Generating tweet with Gemini...');
  const tweetText = await generateTweetText(cards24h);
  console.log(`[post-price-movers] Tweet:\n${tweetText}`);
  console.log(`[post-price-movers] Length: ${tweetText.length} chars`);

  if (tweetText.length > 280) {
    console.warn('[post-price-movers] Tweet exceeds 280 chars — posting anyway (X counts differently).');
  }

  // Post to X
  console.log('[post-price-movers] Posting to X...');
  const result = await postTweet(tweetText);
  console.log(`[post-price-movers] Posted! Tweet ID: ${result?.data?.id}`);
}

main().catch((err) => {
  console.error('[post-price-movers] Fatal:', err.message);
  process.exit(1);
});
