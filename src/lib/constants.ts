import type { Metadata } from 'next';
import { FormatKey, ThresholdKey } from './types';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mtg.syowa.workers.dev';
export const DEFAULT_FORMAT: FormatKey = 'y1995_2003';
export const SITE_NAME = '\u662d\u548cMTG \u9ad8\u984dコモン&アンコモン貴重品室';

export function pageTitle(pageName: string): string {
  return `${pageName} | ${SITE_NAME}`;
}

export const ALL_FORMAT_KEYS: FormatKey[] = [
  'y1995_2003',
  'y2004_2014',
  'y2015_2020',
  'y2021_2022',
  'y2023_2025',
  'y2026_',
  'basic_land',
  'token',
  'foil',
];

export const TAB_LABELS: Record<FormatKey, string> = {
  y1995_2003: '1995\u30012003',
  y2004_2014: '2004\u30012014',
  y2015_2020: '2015\u30012020',
  y2021_2022: '2021\u30012022',
  y2023_2025: '2023\u30012025',
  y2026_: '2026\u3001',
  basic_land: 'Basic Land',
  token: 'Token',
  foil: 'Foil',
};

export const FORMAT_DESCRIPTIONS: Record<FormatKey, string> = {
  y1995_2003: '1995\u30012003\u5e74\u767a\u58f2\u306eMTG\u30bb\u30c3\u30c8\u304b\u3089\u9ad8\u984d\u30b3\u30e2\u30f3\u30fb\u30a2\u30f3\u30b3\u30e2\u30f3\u3092\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
  y2004_2014: '2004\u30012014\u5e74\u767a\u58f2\u306eMTG\u30bb\u30c3\u30c8\u304b\u3089\u9ad8\u984d\u30b3\u30e2\u30f3\u30fb\u30a2\u30f3\u30b3\u30e2\u30f3\u3092\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
  y2015_2020: '2015\u30012020\u5e74\u767a\u58f2\u306eMTG\u30bb\u30c3\u30c8\u304b\u3089\u9ad8\u984d\u30b3\u30e2\u30f3\u30fb\u30a2\u30f3\u30b3\u30e2\u30f3\u3092\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
  y2021_2022: '2021\u30012022\u5e74\u767a\u58f2\u306eMTG\u30bb\u30c3\u30c8\u304b\u3089\u9ad8\u984d\u30b3\u30e2\u30f3\u30fb\u30a2\u30f3\u30b3\u30e2\u30f3\u3092\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
  y2023_2025: '2023\u30012025\u5e74\u767a\u58f2\u306eMTG\u30bb\u30c3\u30c8\u304b\u3089\u9ad8\u984d\u30b3\u30e2\u30f3\u30fb\u30a2\u30f3\u30b3\u30e2\u30f3\u3092\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
  y2026_: '2026\u5e74\u4ee5\u964d\u767a\u58f2\u306eMTG\u30bb\u30c3\u30c8\u304b\u3089\u9ad8\u984d\u30b3\u30e2\u30f3\u30fb\u30a2\u30f3\u30b3\u30e2\u30f3\u3092\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
  basic_land: 'MTG\u306e\u57fa\u672c\u571f\u5730\u9ad8\u984d\u30ab\u30fc\u30c9\u3092\u30bb\u30c3\u30c8\u5225\u306b\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
  token: 'MTG\u306e\u30c8\u30fc\u30af\u30f3\u9ad8\u984d\u30ab\u30fc\u30c9\u3092\u30bb\u30c3\u30c8\u5225\u306b\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
  foil: 'MTG\u306e\u9ad8\u984dFOIL(\u30d5\u30a9\u30a4\u30eb)\u30b3\u30e2\u30f3\u30fb\u30a2\u30f3\u30b3\u30e2\u30f3\u3092\u30bb\u30c3\u30c8\u5225\u306b\u30ea\u30b9\u30c8\u4e00\u89a7\u3067\u307e\u3068\u3081\u3066\u5c55\u793a\u3002',
};

export const FORMAT_PAGE_TITLES: Partial<Record<FormatKey, string>> = {
  y1995_2003: '\u662d\u548cMTG 1995\u30012003\u5e74\u306e\u307b\u307c\u30ec\u30ac\u30b7\u30fc\u306e\u9ad8\u984d\u30b3\u30e2\u30f3&\u30a2\u30f3\u30b3\u30e2\u30f3\u8cb4\u91cd\u54c1\u5ba4',
};

export const OG_LOCALES: Record<string, string> = {
  ja: 'ja_JP',
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_DE',
};

export const DATE_LOCALES: Record<string, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
};

export const THRESHOLD_OPTIONS: Record<ThresholdKey, { values: number[]; default: number }> = {
  common: {
    values: [0.80, 0.90, 1.00, 1.10, 1.20, 1.30, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90, 2.00],
    default: 0.80,
  },
  uncommon: {
    values: [2.00, 2.10, 2.20, 2.30, 2.40, 2.50, 2.60, 2.70, 2.80, 2.90, 3.00, 3.10, 3.20, 3.30, 3.40, 3.50, 3.60, 3.70, 3.80, 3.90, 4.00],
    default: 2.00,
  },
  basicLand: {
    values: [2.50, 2.60, 2.70, 2.80, 2.90, 3.00, 3.10, 3.20, 3.30, 3.40, 3.50, 3.60, 3.70, 3.80, 3.90, 4.00],
    default: 2.50,
  },
  token: {
    values: [2.50, 2.60, 2.70, 2.80, 2.90, 3.00, 3.10, 3.20, 3.30, 3.40, 3.50, 3.60, 3.70, 3.80, 3.90, 4.00],
    default: 2.50,
  },
  foilCommon: {
    values: [4.50, 5.00, 6.50, 7.00, 8.50, 9.00, 10.00],
    default: 10.00,
  },
  foilUncommon: {
    values: [4.50, 5.00, 6.50, 7.00, 8.50, 9.00, 10.00],
    default: 10.00,
  },
};

export const THRESHOLD_VISIBILITY: Record<string, ThresholdKey[]> = {
  basic_land: ['basicLand'],
  token: ['token'],
  foil: ['foilCommon', 'foilUncommon'],
};

export const DEFAULT_THRESHOLD_KEYS: ThresholdKey[] = ['common', 'uncommon'];

export const DEFAULT_THRESHOLDS: Record<ThresholdKey, number> = Object.fromEntries(
  (Object.entries(THRESHOLD_OPTIONS) as [ThresholdKey, { values: number[]; default: number }][])
    .map(([key, opt]) => [key, opt.default]),
) as Record<ThresholdKey, number>;

export const THRESHOLD_LABELS: Record<ThresholdKey, string> = {
  common: 'Common Price Threshold:',
  uncommon: 'Uncommon Price Threshold:',
  basicLand: 'Basic Land Price Threshold:',
  token: 'Token Price Threshold:',
  foilCommon: 'Foil Common Price Threshold:',
  foilUncommon: 'Foil Uncommon Price Threshold:',
};

export function scryfallSetSvgUrl(setCode: string): string {
  return `https://svgs.scryfall.io/sets/${setCode}.svg`;
}
