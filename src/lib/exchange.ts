import { ExchangeRates } from './types';

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY,EUR');
    if (!res.ok) return { JPY: null, EUR: null };
    const data = await res.json();
    return {
      JPY: data.rates?.JPY ?? null,
      EUR: data.rates?.EUR ?? null,
    };
  } catch (err) {
    console.error('[exchange] Failed to fetch rates:', err);
    return { JPY: null, EUR: null };
  }
}
