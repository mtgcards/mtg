'use strict';

/**
 * Shared constants and helpers used by fetch-cards.js and fetch-price-movers.js.
 */

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

function isExcludedSet(name) {
  if (EXCLUDED_SETS.has(name)) return true;
  return EXCLUDED_PREFIXES.some((p) => name.startsWith(p));
}

function isExcludedCard(card) {
  if (EXCLUDED_SET_CODES.has(card.set)) return true;
  return isExcludedSet(card.set_name);
}

module.exports = { EXCLUDED_SET_CODES, EXCLUDED_SETS, EXCLUDED_PREFIXES, isExcludedSet, isExcludedCard };
