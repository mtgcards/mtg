import fs from 'fs';
import path from 'path';
import type { SerializedCard, FormatKey } from './types';

const CARDS_FILE = path.join(process.cwd(), 'src/generated/cards.json');

export function loadCardsForFormat(format: FormatKey): SerializedCard[] {
  try {
    const raw = fs.readFileSync(CARDS_FILE, 'utf-8');
    const cardsData = JSON.parse(raw) as Record<string, SerializedCard[]>;
    return cardsData[format] ?? [];
  } catch {
    console.warn(`[cards] Could not read ${CARDS_FILE}, returning empty array`);
    return [];
  }
}
