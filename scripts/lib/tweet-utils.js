'use strict';
/**
 * Shared utilities for tweet generation used by post-price-movers.js
 * and post-price-movers-manual.js.
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

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
  console.log(`[tweet-utils] Period: ${period} (${periodLabel})`);
  console.log(`[tweet-utils] Style: ${style}`);
  console.log(`[tweet-utils] changePct: ${changePct} / changeAbs: ${changeAbs}`);

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
    '- ハッシュタグは #mtg のみ',
    '- 200文字以内（JavaScriptの文字数基準）に収めること',
    '- 絵文字は最大1個までに抑えること（Xでは絵文字は2文字分としてカウントされるため）',
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

// ---- Image Fetch ----
async function fetchImageBuffer(imageUrl) {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.warn(`[tweet-utils] Image fetch failed (${res.status}): ${imageUrl}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn(`[tweet-utils] Image fetch error: ${err.message}`);
    return null;
  }
}

// ---- X character count (approximates X UI behavior) ----
function countXChars(text) {
  const urlRegex = /https?:\/\/\S+/g;
  let length = 0;
  let lastIndex = 0;

  for (const match of text.matchAll(urlRegex)) {
    length += Array.from(text.slice(lastIndex, match.index)).length;
    length += 23;
    lastIndex = match.index + match[0].length;
  }
  length += Array.from(text.slice(lastIndex)).length;

  const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(text));
  const emojiRegex = /\p{Extended_Pictographic}/u;

  for (const seg of segments) {
    if (emojiRegex.test(seg.segment)) {
      const cpCount = Array.from(seg.segment).length;
      length -= cpCount;
      length += 2;
    }
  }

  return length;
}

function removeFirstEmoji(text) {
  const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(text));
  const emojiRegex = /\p{Extended_Pictographic}/u;

  const firstEmojiIndex = segments.findIndex((s) => emojiRegex.test(s.segment));
  if (firstEmojiIndex === -1) return text;

  const before = segments.slice(0, firstEmojiIndex).map((s) => s.segment).join('');
  const after = segments.slice(firstEmojiIndex + 1).map((s) => s.segment).join('');
  return (before + after).replace(/\s+/g, ' ').replace(/  +/g, ' ').trim();
}

module.exports = {
  STYLES,
  URL_PREFIXES,
  PERIOD_META,
  RELEASE_YEAR_MIN,
  RELEASE_YEAR_MAX,
  pickRandom,
  pickPeriodAndCard,
  generateTweetText,
  fetchImageBuffer,
  countXChars,
  removeFirstEmoji,
};
