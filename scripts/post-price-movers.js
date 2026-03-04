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

// ---- Prompt variation helpers ----

const PERSONAS = [
  'MTG歴20年のベテランプレイヤー。池田と呼ばれ、見てきたカードの歴史を語るのが得意。値上がりには「これは来るばい」と直感で反応する。',
  'MTG始めて3ヶ月の初心者。カード名を読むたび「このカードなにれるの？」と新鮮な目で語る。価格騰起に純粋に驚いている。',
  '昭和生まれのおじさんコレクター。そのカードの昔のトーナメントや値上がりの記憶をぎゅっと語る。@syowamtgの本従キャラ。',
  'カード値段の動きに目が遠い錢金学者タイプ。「なぜ今上がっているのか」を分析し、技巧・リプリント・現店在庫などの要因を推測して語る。',
  'トレードグラインダー。「今買い時か」「待ちか」をはっきり判断する。少し口が悪くても結果が全てお厳しいスタイル。',
];

const STYLES = [
  '箇条書きでサクッと伝える簡潔スタイル。無駄な言葉は一切不要。',
  '絵文字やユニークな表現を活用した温かみのあるスタイル。',
  '速善感や気軽なジョークを交えた明るいスタイル。',
  '詩的・浮かびある表現で、カードへの愛を語るスタイル。',
  'ニュース記事のような客観的・報告スタイル。',
];

const DAY_THEMES = [
  '「週明け」を背に今週のカード定点チェックを問いかける', // 日
  '「週明け」を背に今週のカード定点チェックを問いかける', // 月
  '「火曜日がはじまった」と言いたくなる気分で価格を届ける', // 火
  '「水曜日の山」を越える気分で、笑いを混ぜて価格情報を届ける', // 水
  '「敬老の木曜日」。週平日の疑労を忠罪にしながらMTG価格が気になる', // 木
  '「軽やかな金曜日」。週末値引き前に確認したい人向け', // 金
  '「土曜日の大会デイ」。トーナメントまえにカード相場をチェック', // 土
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- Gemini ----

async function generateTweetText(card) {
  const change24h = card.priceChange24hr != null ? `+$${card.priceChange24hr.toFixed(2)}` : 'N/A';
  const cardInfo = [
    `カード名: ${card.name}`,
    `レアリティ: ${card.rarity}`,
    `セット: ${card.setName}`,
    `現在値段: $${card.price.toFixed(2)}`,
    `24h変動: ${change24h}`,
    card.flavorText ? `フレーバーテキスト: ${card.flavorText}` : null,
  ].filter(Boolean).join('\n');

  const persona = pickRandom(PERSONAS);
  const style = pickRandom(STYLES);
  const dayTheme = DAY_THEMES[new Date().getDay()];

  console.log(`[post-price-movers] Persona: ${persona.slice(0, 24)}...`);
  console.log(`[post-price-movers] Style: ${style}`);
  console.log(`[post-price-movers] Day theme: ${dayTheme}`);

  const prompt = [
    `あなたは次のペルソナです: ${persona}`,
    '',
    '以下の24時間値上がりカードデータをもとに、X(旧Twitter)に投稿する日本語ツイートを1件作成してください。',
    '',
    `「${dayTheme}」の雰囲気を前提に、「${style}」で書いてください。`,
    '',
    '【ルール】',
    '- カード名は英語のままでOK',
    '- 価格の表現方法は自由（数字や絵文字の使い方はお任せ）',
    '- #昭和MTG は必ず入れる。その他のハッシュタグは最大2個まで自由に選ぶ',
    '- 280文字以内に収める（Xの上限）',
    '- ツイート本文のみ出力（前置き・説明文は不要）',
    card.flavorText ? '- フレーバーテキストを引用してもよい（しなくてもよい）' : null,
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
