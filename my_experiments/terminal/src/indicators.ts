import type { Candle } from "./types";

const sma = (xs: number[], p:number) => 
    xs.map((_,i) => i < p-1 ? NaN : xs.slice(i-p +1, i+1).reduce((a,b)=>a+b, 0)/p);

const ema = (xs: number[], p:number) => {
    const k = 2/ (p+1);
    const out: number[] = [];
    let prev = NaN;
    xs.forEach((x,i) => {
        if (i === 0) { prev =x; out.push(x); return;}
        prev = x*k + prev * (1-k);
        out.push(prev);
    });
    return out;
}

const stdev = (xs: number[], p:number) => 
    xs.map((_,i) => {
        if (i < p-1) return NaN;
        const w = xs.slice(i-p+1, i+1);
        const m = w.reduce((a,b) => a+b, 0)/p;
        return Math.sqrt(w.reduce((a,b) => a+(b-m)**2,0)/p);
});

export function bollinger(candles: Candle[], period =20, mult=2) {
    const closes = candles.map (c => c.close);
    const mid = sma(closes, period);
    const std = stdev(closes, period);
    return mid.map((m, i) => ({
        time: candles[i].date,
        upper: m + mult*std[i],
        middle: m,
        lower: m-mult*std[i],
    }));
}

export function macd(candles: Candle[], fast=12, slow=26, signal=9)
{
    const closes = candles.map(c => c.close);
    const ef = ema(closes, fast);
    const es = ema(closes, slow);
    const line = ef.map((v,i) => v - es[i]);
    const sig=ema(line, signal);
    const hist = line.map((v,i)=> v- sig[i]);
    return candles.map((c,i) => ({time: c.date, macd: line[i], signal:signal[i], hist: hist[i]}));
}

export function fibRetracement(candles: Candle[]) {
    if (!candles.length) return null;
    let hi = -Infinity, lo = Infinity, hiI = 0, loI = 0;
    candles.forEach((c,i) => {
        if (c.high > hi) { hi = c.high;hiI=i}
        if (c.low < lo) { lo = c.low; loI = i}
    });
    const uptrend = loI < hiI;
    const range = hi - lo;
    const ratios = [0,0.236, 0.382, 0.5, 0.618, 0.786 ,1];
    const levels = ratios.map(r => ({
        ratio: r,
        price: uptrend? hi-range * r:lo + range * r, 
    }));
    return { high: hi, low: lo, uptrend, levels};
}

export function acidTest(balanceSheet: any): number | null {
    if (!balanceSheet) return null;
    const ca = balanceSheet.totalCurrentAssets ?? balanceSheet.CurrentAssets;
    const inv = balanceSheet.inventory ?? 0;
    const cl = balanceSheet.totalCurrentLiabilities ?? balanceSheet.currentLiabilities;
    const v = (n: any) => typeof n === 'object' ? n?.raw : n;
    const Ca = v(ca), Inv = v(inv), Cl = v(cl);
    if (!Ca || !Cl) return null;
    return (Ca - Inv) / Cl;
}