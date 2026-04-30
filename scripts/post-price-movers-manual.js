'use strict';
/**
 * Generates a tweet about MTG price movers using Gemini.
 * Reads src/generated/price-movers.json and randomly picks a period (24h/7d/30d/90d) and card.
 * Only posts cards released between 1995 and 2014.
 *
 * Outputs tweet text and card image to tmp/manual-post/ for manual posting to X.
 *
 * Required env vars:
 * GOOGLE_API_KEY
 *
 * NOTE: priceChangeXxd fields from JustTCG API are PERCENTAGE values (e.g. 21.91 = +21.91%).
 * Dollar change is back-calculated as: price - price / (1 + pct/100)
 */

const { readFile, writeFile, mkdir } = require('node:fs/promises');
const path = require('node:path');
const {
  URL_PREFIXES,
  pickRandom,
  pickPeriodAndCard,
  generateTweetText,
  fetchImageBuffer,
  countXChars,
  removeFirstEmoji,
} = require('./lib/tweet-utils');

// ---- Output directory ----
const OUTPUT_DIR = 'tmp/manual-post';

// ---- Main ----
async function main() {
  console.log('[post-price-movers-manual] Script started.');

  const missing = ['GOOGLE_API_KEY']
    .filter((k) => !process.env[k]);

  if (missing.length > 0) {
    console.error(`[post-price-movers-manual] Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  let data;
  try {
    const raw = await readFile('src/generated/price-movers.json', 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`[post-price-movers-manual] Failed to read price-movers.json: ${err.message}`);
    process.exit(1);
  }

  const result = pickPeriodAndCard(data);
  if (!result) {
    console.log(`[post-price-movers-manual] No suitable cards found. Skipping.`);
    return;
  }

  const { period, card } = result;
  console.log(`[post-price-movers-manual] Selected period: ${period} / card: ${card.name} (${card.releaseYear})`);

  console.log('[post-price-movers-manual] Generating tweet with Gemini...');
  const generatedText = await generateTweetText(card, period);

  const urlPrefix = pickRandom(URL_PREFIXES);
  const tweetText = `${generatedText}\n${urlPrefix} https://mtg.syowa.workers.dev/`;

  console.log(`[post-price-movers-manual] Final Tweet Length (JS): ${tweetText.length} chars`);

  // Validate against X character limit and auto-trim emojis if over limit
  let finalTweetText = tweetText;
  let xLen = countXChars(finalTweetText);
  console.log(`[post-price-movers-manual] X estimated chars: ${xLen} / 280`);

  // If over limit, remove emojis one by one until it fits
  while (xLen > 280) {
    const next = removeFirstEmoji(finalTweetText);
    if (next === finalTweetText) break;
    finalTweetText = next;
    xLen = countXChars(finalTweetText);
    console.log(`[post-price-movers-manual] Removed an emoji → X estimated chars: ${xLen} / 280`);
  }

  if (xLen > 280) {
    console.warn(`[post-price-movers-manual] ⚠️ WARNING: Tweet still exceeds X limit by ${xLen - 280} chars after removing all emojis. Please trim manually.`);
  } else if (finalTweetText !== tweetText) {
    console.log(`[post-price-movers-manual] ✅ Auto-trimmed to fit X limit. Emojis removed.`);
  } else {
    console.log(`[post-price-movers-manual] ✅ Tweet is within X character limit.`);
  }

  // ---- Output for manual posting ----
  await mkdir(OUTPUT_DIR, { recursive: true });

  const timestamp = Date.now();

  // Save tweet text
  const textFile = path.join(OUTPUT_DIR, `tweet-${timestamp}.txt`);
  await writeFile(textFile, finalTweetText, 'utf-8');
  console.log(`[post-price-movers-manual] ✅ Tweet text saved to: ${textFile}`);

  // Save card image
  let imageFile = null;
  if (card.imageUrl) {
    console.log(`[post-price-movers-manual] Fetching image for ${card.name}...`);
    const imageBuffer = await fetchImageBuffer(card.imageUrl);
    if (imageBuffer) {
      const ext = path.extname(new URL(card.imageUrl).pathname) || '.jpg';
      imageFile = path.join(OUTPUT_DIR, `image-${timestamp}${ext}`);
      await writeFile(imageFile, imageBuffer);
      console.log(`[post-price-movers-manual] ✅ Image saved to: ${imageFile} (${imageBuffer.length} bytes)`);
    }
  }

  // Print manual post info
  console.log('\n========================================');
  console.log('【手動ポスト用情報】');
  console.log('----------------------------------------');
  console.log('【画像URL】');
  console.log(card.imageUrl || '(画像なし)');
  console.log('----------------------------------------');
  console.log('【ツイート本文】');
  console.log(finalTweetText);
  console.log('----------------------------------------');
  console.log(`【JS文字数】 ${finalTweetText.length}`);
  console.log(`【X推定文字数】 ${xLen} / 280${xLen <= 280 ? '' : ' ⚠️超過'}`);
  console.log('========================================\n');

  console.log('[post-price-movers-manual] ⚠️ X API is disabled.');
  console.log('[post-price-movers-manual] Please copy the text above and post manually to X.');
  if (imageFile) {
    console.log(`[post-price-movers-manual] Attach the saved image: ${imageFile}`);
  }
}

main().catch((err) => {
  console.error('[post-price-movers-manual] Fatal Error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
