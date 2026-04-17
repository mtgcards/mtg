import type { APIRoute } from 'astro';
import type { ExchangeRates } from '@/lib/types';

export const GET: APIRoute = async () => {
  try {
    const fetchOptions: RequestInit & { cf?: { cacheTtl: number } } = {};
    if (typeof process !== 'undefined' && process.env.CF_WORKER_ENV) {
      fetchOptions.cf = { cacheTtl: 3600 };
    }

    const res = await fetch(
      'https://api.frankfurter.app/latest?from=USD&to=JPY,EUR',
      fetchOptions,
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ JPY: null, EUR: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const rates: ExchangeRates = {
      JPY: data.rates?.JPY ?? null,
      EUR: data.rates?.EUR ?? null,
    };

    return new Response(JSON.stringify(rates), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response(JSON.stringify({ JPY: null, EUR: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
