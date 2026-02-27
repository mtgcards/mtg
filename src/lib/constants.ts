import type { Metadata } from 'next';
import { FormatKey, ThresholdKey } from './types';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mtg-common-uncommon-cloudflare.masasikatano.workers.dev';
export const DEFAULT_FORMAT: FormatKey = 'y1993_2003';
export const SITE_NAME = '昭和MTG 高額コモン&アンコモン貴重品室';

export function pageTitle(pageName: string): string {
  return `${pageName} | ${SITE_NAME}`;
}

export const ALL_FORMAT_KEYS: FormatKey[] = [
  'y1993_2003',
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
  y1993_2003: '1995〜2003',
  y2004_2014: '2004〜2014',
  y2015_2020: '2015〜2020',
  y2021_2022: '2021〜2022',
  y2023_2025: '2023〜2025',
  y2026_: '2026〜',
  basic_land: 'Basic Land',
  token: 'Token',
  foil: 'Foil',
};

export const FORMAT_DESCRIPTIONS: Record<FormatKey, string> = {
  y1993_2003: '1995〜2003年発売のMTGセットから高額コモン・アンコモンをリスト一覧でまとめて展示。',
  y2004_2014: '2004〜2014年発売のMTGセットから高額コモン・アンコモンをリスト一覧でまとめて展示。',
  y2015_2020: '2015〜2020年発売のMTGセットから高額コモン・アンコモンをリスト一覧でまとめて展示。',
  y2021_2022: '2021〜2022年発売のMTGセットから高額コモン・アンコモンをリスト一覧でまとめて展示。',
  y2023_2025: '2023〜2025年発売のMTGセットから高額コモン・アンコモンをリスト一覧でまとめて展示。',
  y2026_: '2026年以降発売のMTGセットから高額コモン・アンコモンをリスト一覧でまとめて展示。',
  basic_land: 'MTGの高額Basic Landカードをセット別にリスト一覧でまとめて展示。',
  token: 'MTGの高額トークンカードをセット別にリスト一覧でまとめて展示',
  foil: 'MTGの高額フォイルコモン・アンコモンをセット別にリスト一覧でまとめて展示',
};

export function buildFormatMetadata(label: string, description: string, pageUrl: string): Metadata {
  const title = pageTitle(label);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

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

export const THRESHOLD_LABELS: Record<ThresholdKey, string> = {
  common: 'Common Price Threshold:',
  uncommon: 'Uncommon Price Threshold:',
  basicLand: 'Basic Land Price Threshold:',
  token: 'Token Price Threshold:',
  foilCommon: 'Foil Common Price Threshold:',
  foilUncommon: 'Foil Uncommon Price Threshold:',
};
