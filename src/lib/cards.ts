import type { SerializedCard, FormatKey } from './types';

const modules = import.meta.glob('../generated/cards.json', { eager: true });
const cardsData = (modules['../generated/cards.json'] as { default?: Record<string, SerializedCard[]> } | undefined)?.default ?? {};

export function loadCardsForFormat(format: FormatKey): SerializedCard[] {
  return cardsData[format] ?? [];
}

export function loadAllCards(): SerializedCard[] {
  return Object.values(cardsData).flat();
}

export function getAllSetCodes(): string[] {
  const allCards = loadAllCards();
  const setMap = new Map<string, { setName: string; releasedAt: string }>();
  for (const card of allCards) {
    if (!setMap.has(card.set)) {
      setMap.set(card.set, { setName: card.setName, releasedAt: card.releasedAt });
    }
  }
  return Array.from(setMap.keys());
}

export function getSetInfo(setCode: string): { setName: string; releasedAt: string } | null {
  const allCards = loadAllCards();
  for (const card of allCards) {
    if (card.set === setCode) {
      return { setName: card.setName, releasedAt: card.releasedAt };
    }
  }
  return null;
}
