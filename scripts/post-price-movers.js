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
const {
  URL_PREFIXES,
  pickRandom,
  pickPeriodAndCard,
  generateTweetText,
  fetchImageBuffer,
  countXChars,
  removeFirstEmoji,
} = require('./lib/tweet-utils');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const X_API_KEY = process.env.X_API_KEY || '';
const X_API_KEY_SECRET = process.env.X_API_KEY_SECRET || '';
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN || '';
const X_ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET || '';

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

  console.log(`[post-price-movers] Final Tweet Length (JS): ${tweetText.length} chars`);

  // Validate against X character limit and auto-trim emojis if over limit
  let finalTweetText = tweetText;
  let xLen = countXChars(finalTweetText);
  console.log(`[post-price-movers] X estimated chars: ${xLen} / 280`);

  // If over limit, remove emojis one by one until it fits
  while (xLen > 280) {
    const next = removeFirstEmoji(finalTweetText);
    if (next === finalTweetText) break;
    finalTweetText = next;
    xLen = countXChars(finalTweetText);
    console.log(`[post-price-movers] Removed an emoji → X estimated chars: ${xLen} / 280`);
  }

  if (xLen > 280) {
    console.error(`[post-price-movers] ❌ Tweet still exceeds X limit by ${xLen - 280} chars after removing all emojis. Aborting post.`);
    process.exit(1);
  } else if (finalTweetText !== tweetText) {
    console.log(`[post-price-movers] ✅ Auto-trimmed to fit X limit. Emojis removed.`);
  } else {
    console.log(`[post-price-movers] ✅ Tweet is within X character limit.`);
  }

  console.log(`[post-price-movers] Posting to X with ${mediaIds.length} image(s)...`);

  await postTweet(finalTweetText, mediaIds);
}

main().catch((err) => {
  console.error('[post-price-movers] Fatal Error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
