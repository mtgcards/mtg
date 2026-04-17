import type { SerializedCard, FormatKey } from './types';

const modules = import.meta.glob('../generated/cards.json', { eager: true });
const cardsData = (modules['../generated/cards.json'] as { default?: Record<string, SerializedCard[]> } | undefined)?.default ?? {};

export function loadCardsForFormat(format: FormatKey): SerializedCard[] {
  return cardsData[format] ?? [];
}
