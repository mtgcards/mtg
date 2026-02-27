import type { SerializedCard, FormatKey } from './types';
import cardsData from '@/generated/cards.json';

export function fetchCardsForFormat(format: FormatKey): SerializedCard[] {
  return (cardsData as unknown as Record<string, SerializedCard[]>)[format] ?? [];
}
