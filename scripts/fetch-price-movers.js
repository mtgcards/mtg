'use strict';

/**
 * Prebuild script: fetches JustTCG price mover data and writes to
 * src/generated/price-movers.json before `next build` runs.
 *
 * Usage: node scripts/fetch-price-movers.js
 * (automatically invoked via npm's `prebuild` lifecycle hook)
 */

const { mkdir, writeFile } = require('node:fs/promises');

const API_BASE = 'https://api.justtcg.com/v1';
const API_KEY = process.env.JUSTTCG_API_KEY || '';

const PERIODS = ['24h', '7d', '30d', '90d'];
const TOP_SETS_PER_PERIOD = 8;
const TOP_CARDS_PER_PERIOD = 50;

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

// ---- Helpers ----

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isExcludedSet(name) {
  if (EXCLUDED_SETS.has(name)) return true;
  return EXCLUDED_PREFIXES.some((p) => name.startsWith(p));
}

function getSetChangePct(set, period) {
  switch (period) {
    case '24h':
    case '7d':  return set.set_value_change_7d_pct ?? 0;
    case '30d': return set.set_value_change_30d_pct ?? 0;
    case '90d': return set.set_value_change_90d_pct ?? 0;
  }
  return 0;
}

function getPriceChange(card, period) {
  switch (period) {
    case '24h': return card.priceChange24hr;
    case '7d':  return card.priceChange7d;
    case '30d': return card.priceChange30d;
    case '90d': return card.priceChange90d;
  }
  return null;
}

function pickVariant(variants) {
  const nmNormal = variants.find((v) => v.printing === 'Normal' && v.condition === 'Near Mint');
  if (nmNormal) return nmNormal;
  const anyNormal = variants.find((v) => v.printing === 'Normal');
  if (anyNormal) return anyNormal;
  return variants[0] || null;
}

function scryfallImageUrl(id) {
  return `https://cards.scryfall.io/normal/front/${id.charAt(0)}/${id.charAt(1)}/${id}.jpg`;
}

// ---- API calls ----

async function jtcgFetch(path, params) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  // Log URL without API key for debugging
  const displayUrl = url.toString().replace(API_KEY, '***');
  console.log(`[fetch-price-movers] GET ${displayUrl}`);
  let res;
  try {
    res = await fetch(url.toString(), { headers: { 'x-api-key': API_KEY } });
  } catch (err) {
    console.warn(`[fetch-price-movers] JustTCG ${path} network error: ${err.message}`);
    return null;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)');
    console.warn(`[fetch-price-movers] JustTCG ${path} failed: HTTP ${res.status} — ${body}`);
    return null;
  }
  return res.json();
}

async function fetchAllSets() {
  const data = await jtcgFetch('/sets', {
    game: 'magic-the-gathering',
    orderBy: 'release_date',
    order: 'desc',
    limit: '500',
  });
  return data?.data ?? [];
}

async function fetchCardsForSet(setId) {
  const data = await jtcgFetch('/cards', {
    set: setId,
    orderBy: '90d',
    order: 'desc',
    limit: '20',
    min_price: '1.00',
  });
  return data?.data ?? [];
}

async function fetchScryfallImageByName(name) {
  try {
    const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.id ? scryfallImageUrl(data.id) : null;
  } catch {
    return null;
  }
}

// ---- Main ----

async function main() {
  const emptyResult = { '24h': [], '7d': [], '30d': [], '90d': [] };

  if (!API_KEY) {
    console.log('[fetch-price-movers] JUSTTCG_API_KEY not set — writing empty data');
    await mkdir('src/generated', { recursive: true });
    await writeFile('src/generated/price-movers.json', JSON.stringify(emptyResult));
    return;
  }

  // 1. Fetch all MTG sets (1 API call)
  console.log('[fetch-price-movers] Fetching MTG sets...');
  const allSets = await fetchAllSets();
  console.log(`[fetch-price-movers] fetchAllSets returned ${allSets.length} sets`);
  if (allSets.length === 0) {
    console.warn('[fetch-price-movers] No sets returned — writing empty data');
    await mkdir('src/generated', { recursive: true });
    await writeFile('src/generated/price-movers.json', JSON.stringify(emptyResult));
    return;
  }
  const eligibleSets = allSets.filter((s) => !isExcludedSet(s.name));
  console.log(`[fetch-price-movers] ${eligibleSets.length} eligible sets`);

  // 2. Find top sets per period, collect unique set IDs
  const topSetsByPeriod = {};
  const uniqueSetIds = new Set();

  for (const period of PERIODS) {
    const sorted = [...eligibleSets].sort(
      (a, b) => getSetChangePct(b, period) - getSetChangePct(a, period),
    );
    topSetsByPeriod[period] = sorted.slice(0, TOP_SETS_PER_PERIOD);
    for (const s of topSetsByPeriod[period]) uniqueSetIds.add(s.id);
  }

  console.log(`[fetch-price-movers] Fetching cards from ${uniqueSetIds.size} unique sets...`);

  // 3. Fetch cards for each unique set (rate-limited)
  const cardsBySetId = {};
  let callCount = 0;

  for (const setId of uniqueSetIds) {
    if (callCount > 0) await delay(7000); // 10 req/min limit: 7s gap keeps total under limit
    const cards = await fetchCardsForSet(setId);
    cardsBySetId[setId] = cards;
    callCount++;
    process.stdout.write(`\r[fetch-price-movers] Sets fetched: ${callCount}/${uniqueSetIds.size}`);
  }
  process.stdout.write('\n');

  // 4. Build card list per period
  const rawByPeriod = {};

  for (const period of PERIODS) {
    const seen = new Set();
    const cards = [];

    for (const set of topSetsByPeriod[period]) {
      for (const card of cardsBySetId[set.id] ?? []) {
        const rarity = card.rarity?.toLowerCase();
        if (rarity !== 'common' && rarity !== 'uncommon') continue;
        if (EXCLUDED_SET_CODES.has(card.set?.toLowerCase())) continue;
        if (isExcludedSet(card.set_name)) continue;

        const variant = pickVariant(card.variants ?? []);
        if (!variant || variant.price <= 0) continue;

        const minPrice = rarity === 'common' ? 1.00 : 2.00;
        if (variant.price < minPrice) continue;

        const change = getPriceChange(variant, period);
        if (change === null || change <= 0) continue;

        // Deduplicate by name within this period
        if (seen.has(card.name)) continue;
        seen.add(card.name);

        cards.push({
          name: card.name,
          rarity,
          setId: card.set,
          setName: card.set_name,
          imageUrl: card.scryfallId ? scryfallImageUrl(card.scryfallId) : null,
          price: variant.price,
          priceChange24hr: variant.priceChange24hr ?? null,
          priceChange7d: variant.priceChange7d ?? null,
          priceChange30d: variant.priceChange30d ?? null,
          priceChange90d: variant.priceChange90d ?? null,
        });
      }
    }

    // Sort by price change for this period descending
    cards.sort((a, b) => {
      const ca = getPriceChange(a, period) ?? -Infinity;
      const cb = getPriceChange(b, period) ?? -Infinity;
      return cb - ca;
    });

    rawByPeriod[period] = cards.slice(0, TOP_CARDS_PER_PERIOD);
    console.log(`[fetch-price-movers]   ${period}: ${rawByPeriod[period].length} cards`);
  }

  // 5. Collect card names missing images across all periods
  const missingImageNames = new Set();
  for (const cards of Object.values(rawByPeriod)) {
    for (const card of cards) {
      if (!card.imageUrl) missingImageNames.add(card.name);
    }
  }

  // 6. Resolve missing images via Scryfall named lookup
  console.log(`[fetch-price-movers] Resolving ${missingImageNames.size} images via Scryfall...`);
  const nameToImage = {};
  let imgCount = 0;

  for (const name of missingImageNames) {
    if (imgCount > 0) await delay(120); // respect Scryfall rate limit
    nameToImage[name] = await fetchScryfallImageByName(name);
    imgCount++;
    process.stdout.write(`\r[fetch-price-movers] Images resolved: ${imgCount}/${missingImageNames.size}`);
  }
  process.stdout.write('\n');

  // Apply resolved images
  for (const cards of Object.values(rawByPeriod)) {
    for (const card of cards) {
      if (!card.imageUrl && nameToImage[card.name]) {
        card.imageUrl = nameToImage[card.name];
      }
    }
  }

  // 7. Write JSON
  await mkdir('src/generated', { recursive: true });
  await writeFile('src/generated/price-movers.json', JSON.stringify(rawByPeriod));
  console.log('[fetch-price-movers] Written to src/generated/price-movers.json');
}

main().catch((err) => {
  console.error('[fetch-price-movers] Failed:', err.message);
  process.exit(1);
});
