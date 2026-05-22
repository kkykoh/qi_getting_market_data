import type { Candle } from './types';

// export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
//     if (!symbols.length) return [];
//     const r = await fetch(`/api/quotes?symbols=${symbols.join(',')}`);
//     return r.json();
// }

// export async function fetchChart(symbol: string, range ='6mo', interval='1d'): Promise<Candle[]>{
//     const r = await fetch(`/api/chart/${symbol}?range=${range}&interval=${interval}`);
//     const raw = await r.json();
//     return raw.map((q: any) => ({
//         date: q.date, open: q.open, high: q.high, low: q.low, close: q.close, volume: q.volume,
//     }));
// }

// export async function fetchFundamentals(symbol: string): Promise<any> {
//     const r = await fetch(`/api/fundamentals/${symbol}`);
//     return r.json();
// }

export const fetchQuotes = (symbols: string[]) =>
  symbols.length ? safeJson<any>(`/api/quotes?symbols=${symbols.join(',')}`, []) : Promise.resolve([]);

export const fetchChart = async(symbol: string, range ='6mo', interval='1d'): Promise<Candle[]> => {
    const raw = await safeJson<any>(`/api/chart/${symbol}?range=${range}&interval=${interval}`, []);
    return raw.map((q: any) => ({
        date: q.date, open: q.open, high: q.high, low: q.low, close: q.close, volume: q.volume,
    }));
}

export const fetchFundamentals = (symbol: string) =>
    safeJson<any>(`/api/fundamentals/${symbol}`, null);

export type Universe = {sectors: Record<string, {symbol: string; name:string; sector: string; subIndustry: string} []>;
userTickers: {symbol: string; sector: string; addedAt: number}[];
}

export const fetchUniverse = () => safeJson<Universe>('/api/universe', {sectors: {}, userTickers: [] });

export const addTicker = (symbol: string, sector: string) => fetch('/api/tickers', { method: 'POST', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({ symbol, sector }),}).then(r => r.json());

export const removeTicker = (symbol:string) => fetch(`/api/tickers/${symbol}`, { method: 'DELETE'}).then(r => r.json());

async function safeJson<T>(url: string, fallback: T): Promise<T> {
    try {
        const r = await fetch(url);
        if (!r.ok) {
            console.warn(`[api] ${url} -> ${r.status}`); return fallback;
        } 
        const text = await r.text();
        return JSON.parse(text) as T;
    }  catch (e) {
        console.warn(`[api] ${url} failed`, e);
        return fallback;
    }
}
