import fs from 'fs';
import path from 'path';
import type { SerializedCard, FormatKey } from './types';

export function fetchCardsForFormat(format: FormatKey): SerializedCard[] {
  const filePath = path.join(process.cwd(), 'src/generated/cards.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const cardsData = JSON.parse(raw) as Record<string, SerializedCard[]>;
  return cardsData[format] ?? [];
}
