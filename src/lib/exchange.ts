import { useState, useEffect } from 'react';
import { ExchangeRates } from './types';

const DEFAULT_RATES: ExchangeRates = { JPY: null, EUR: null };

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY,EUR');
    if (!res.ok) return DEFAULT_RATES;
    const data = await res.json();
    return {
      JPY: data.rates?.JPY ?? null,
      EUR: data.rates?.EUR ?? null,
    };
  } catch (err) {
    console.error('[exchange] Failed to fetch rates:', err);
    return DEFAULT_RATES;
  }
}

export function useExchangeRates(): ExchangeRates {
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);
  useEffect(() => {
    fetchExchangeRates().then(setRates);
  }, []);
  return rates;
}
