'use strict';

/**
 * Prebuild script: streams Scryfall bulk data and writes filtered card data
 * to src/generated/cards.json before `next build` runs.
 *
 * Usage: node scripts/fetch-cards.js
 * (automatically invoked via npm's `prebuild` lifecycle hook)
 */

const { Readable, Writable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { mkdir, writeFile } = require('node:fs/promises');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

// ---- Constants (mirrors src/lib/constants.ts and src/lib/scryfall.ts) ----

const EXCLUDED_SET_CODES = new Set([
  'lea', 'leb', 'unk', '30a', 'ced', 'cei', 'ptc',
  'sld', 'slp', 'slc', 'slu', 'pssc',
]);

const EXCLUDED_SETS = new Set([
  'Foreign Black Border', 'Summer Magic / Edgar', 'Beatdown Box Set',
  'Battle Royale Box Set', 'Media and Collaboration Promos', 'Unglued',
  'Renaissance', 'Introductory Two-Player Set', 'MicroProse Promos',
  'Fourth Edition Foreign Black Border', 'Unlimited Edition', 'Rinascimento',
  'Salvat 2005', 'Salvat 2011', 'Planechase Planes', 'Planechase',
  'Archenemy Schemes', 'Archenemy', 'DCI Promos', 'New Phyrexia Promos',
  'Planechase 2012 Planes', 'Planechase 2012', 'Face the Hydra',
  'Battle the Horde', 'M15 Prerelease Challenge', 'Planechase Anthology Planes',
  'Planechase Anthology', 'Commander Anthology Tokens',
  'Commander Anthology Volume II Tokens', 'Commander Anthology Volume II',
  'Core Set 2020 Promos', 'The List',
  'Adventures in the Forgotten Realms Tokens', 'Mystery Booster 2',
]);

const EXCLUDED_PREFIXES = ['Duel Decks:', 'Duel Decks Anthology:', 'Archenemy:'];

const DATE_RANGES = {
  y1993_2003: { start: '1995-01-01', end: '2003-12-31' },
  y2004_2014: { start: '2004-01-01', end: '2014-12-31' },
  y2015_2020: { start: '2015-01-01', end: '2020-12-31' },
  y2021_2022: { start: '2021-01-01', end: '2022-12-31' },
  y2023_2025: { start: '2023-01-01', end: '2025-12-31' },
  y2026_: { start: '2026-01-01' },
};

// ---- Helpers ----

function isExcluded(card) {
  if (EXCLUDED_SET_CODES.has(card.set)) return true;
  if (EXCLUDED_SETS.has(card.set_name)) return true;
  return EXCLUDED_PREFIXES.some((p) => card.set_name.startsWith(p));
}

function usdPrice(card) {
  return card.prices.usd ? parseFloat(card.prices.usd) : null;
}

function foilPrice(card) {
  if (card.prices.usd_foil) return parseFloat(card.prices.usd_foil);
  if (card.prices.eur_foil) return parseFloat(card.prices.eur_foil);
  return null;
}

function imageUrl(card) {
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal;
  return null;
}

function serialize(card, isFoil) {
  let priceUsdFoil = null;
  let priceEurFoil = null;
  if (isFoil) {
    if (card.prices.usd_foil) priceUsdFoil = parseFloat(card.prices.usd_foil);
    else if (card.prices.eur_foil) priceEurFoil = parseFloat(card.prices.eur_foil);
  }
  return {
    name: card.name,
    set: card.set,
    setName: card.set_name,
    rarity: card.rarity,
    releasedAt: card.released_at,
    imageUrl: imageUrl(card),
    priceUsd: card.prices.usd ? parseFloat(card.prices.usd) : null,
    priceUsdFoil,
    priceEurFoil,
  };
}

function categorize(card, buckets) {
  if (isExcluded(card) || card.border_color === 'gold') return;

  const typeLine = card.type_line?.toLowerCase() ?? '';

  if (typeLine.includes('basic')) {
    const p = usdPrice(card);
    if (p !== null && p >= 2.50) {
      (buckets.basic_land ??= []).push(card);
    }
    return;
  }

  if (card.layout === 'token' || typeLine.includes('emblem')) {
    const p = usdPrice(card);
    if (p !== null && p >= 2.50) {
      (buckets.token ??= []).push(card);
    }
    return;
  }

  if (card.rarity !== 'common' && card.rarity !== 'uncommon') return;

  const usd = usdPrice(card);
  if (usd !== null && card.released_at) {
    const min = card.rarity === 'common' ? 0.80 : 2.00;
    if (usd >= min) {
      for (const [fmt, range] of Object.entries(DATE_RANGES)) {
        if (card.released_at < range.start) continue;
        if (range.end && card.released_at > range.end) continue;
        (buckets[fmt] ??= []).push(card);
        break;
      }
    }
  }

  const fp = foilPrice(card);
  if (fp !== null && fp >= 4.50) {
    (buckets.foil ??= []).push(card);
  }
}

// ---- Main ----

async function main() {
  console.log('[fetch-cards] Fetching bulk data metadata...');
  const metaRes = await fetch('https://api.scryfall.com/bulk-data/default-cards');
  if (!metaRes.ok) throw new Error(`Metadata fetch failed: ${metaRes.status}`);
  const { download_uri } = await metaRes.json();

  console.log('[fetch-cards] Streaming bulk data...');
  const dataRes = await fetch(download_uri);
  if (!dataRes.ok) throw new Error(`Bulk data fetch failed: ${dataRes.status}`);

  const nodeStream = Readable.fromWeb(dataRes.body);
  const buckets = {};
  let count = 0;

  await pipeline(
    nodeStream,
    parser(),
    streamArray(),
    new Writable({
      objectMode: true,
      write({ value: card }, _, cb) {
        categorize(card, buckets);
        count++;
        if (count % 10000 === 0) process.stdout.write(`\r[fetch-cards] ${count} cards processed...`);
        cb();
      },
    }),
  );

  process.stdout.write('\n');
  console.log(`[fetch-cards] Total: ${count} cards processed`);

  // Sort and serialize
  const results = {};
  for (const [fmt, cards] of Object.entries(buckets)) {
    const isFoil = fmt === 'foil';
    const getPx = isFoil ? foilPrice : usdPrice;
    if (fmt === 'basic_land' || fmt === 'token') {
      cards.sort((a, b) => (getPx(b) ?? 0) - (getPx(a) ?? 0));
    } else {
      cards.sort((a, b) => {
        if (a.rarity !== b.rarity) return a.rarity === 'common' ? -1 : 1;
        return (getPx(b) ?? 0) - (getPx(a) ?? 0);
      });
    }
    results[fmt] = cards.map((c) => serialize(c, isFoil));
    console.log(`[fetch-cards]   ${fmt}: ${results[fmt].length} cards`);
  }

  await mkdir('src/generated', { recursive: true });
  await writeFile('src/generated/cards.json', JSON.stringify(results));
  console.log('[fetch-cards] Written to src/generated/cards.json');
}

main().catch((err) => {
  console.error('[fetch-cards] Failed:', err.message);
  process.exit(1);
});
