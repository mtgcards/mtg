import { useState, useEffect } from 'react';
import { ExchangeRates } from './types';

const DEFAULT_RATES: ExchangeRates = { JPY: null, EUR: null };

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    // 同じオリジンのAPI Route経由で取得（CORS回避）
    const res = await fetch('/api/exchange');
    if (!res.ok) return DEFAULT_RATES;
    return await res.json();
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
