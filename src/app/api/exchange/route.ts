import { NextResponse } from 'next/server';
import { ExchangeRates } from '@/lib/types';

export async function GET() {
  try {
    // Cloudflare Workers環境では cf キャッシュオプションを使用可能
    const fetchOptions: RequestInit & { cf?: { cacheTtl: number } } = {};
    if (typeof process !== 'undefined' && process.env.CF_WORKER_ENV) {
      fetchOptions.cf = { cacheTtl: 3600 };
    }
    
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY,EUR', fetchOptions);
    
    if (!res.ok) {
      return NextResponse.json({ JPY: null, EUR: null });
    }
    
    const data = await res.json();
    const rates: ExchangeRates = {
      JPY: data.rates?.JPY ?? null,
      EUR: data.rates?.EUR ?? null,
    };
    
    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
      },
    });
  } catch {
    return NextResponse.json({ JPY: null, EUR: null });
  }
}
