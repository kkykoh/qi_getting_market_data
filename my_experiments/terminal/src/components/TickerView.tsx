import { useEffect, useState } from "react";
import type { Candle } from "../types";
import { fetchChart, fetchFundamentals, fetchQuotes } from "../api";
import MACDChart from "./MACDChart";
import CandleChart from "./CandleChart";
import Fundamentals from "./Fundamentals";



const RANGES: { label: string; range: string; interval: string }[] = [
    { 'label': '5D', range: '5d', interval: '15m' },
    { 'label': '1M', range: '1mo', interval: '1d' },
    { 'label': '3M', range: '3mo', interval: '1d' },
    { 'label': '6M', range: '6mo', interval: '1d' },
    { 'label': '1Y', range: '1y', interval: '1d' },
    { 'label': '5Y', range: '5y', interval: '1wk' },
]

export default function TickerView({ symbol }: { symbol: string }) {
    const [candles, setCandles] = useState<Candle[]>([]);
    const [fund, setFund] = useState<any>(null);
    const [quote, setQuote] = useState<any>(null);
    const [rangeIdx, setRangeIdx] = useState(3);

    useEffect(() => {
        const r = RANGES[rangeIdx];
        fetchChart(symbol, r.range, r.interval).then(setCandles);
    }, [symbol, rangeIdx]);

    useEffect(() => {
        fetchFundamentals(symbol).then(setFund);
        fetchQuotes([symbol]).then(qs => setQuote(qs[0]));
    }, [symbol]);

    const up = (quote?.regularMarketChangePercent ?? 0) >= 0;

    return (
        <div className="ticker">
            <div className="ticker-head">
                <h2>
                    {symbol}
                    <small>{quote?.longName ?? quote?.shortName ?? ''}</small>
                </h2>
                <div className="quote-line">
                    <span className="px">
                        {quote?.regularMarketPrice?.toFixed(2) ?? '-'}
                    </span>
                    <span className={up ? 'pos' : 'neg'}>
                        {quote?.regularMarketChange?.toFixed(2)} ({quote.regularMarketChangePercent?.toFixed(2)}%)
                    </span>
                </div>
                <div className="range-tabs">
                    {RANGES.map((r, i) => (
                        <button key={r.label} className={i === rangeIdx ? 'active' : ''} onClick={() => setRangeIdx(i)}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="ticker-head">
                <h2>
                    {symbol}
                    <small>{quote?.longName ?? quote?.shortName ?? ''}</small>
                </h2>
                <div className="quote-line">
                    <span className="px">
                        {quote?.regularMarketPrice?.toFixed(2) ?? '-'}
                    </span>
                    <span className={up ? 'pos' : 'neg'}>
                        {quote?.regularMarketChange?.toFixed(2)} ({quote.regularMarketChangePercent?.toFixed(2)}%)
                    </span>
                </div>
                <div className="range-tabs">
                    {RANGES.map((r, i) => (
                        <button key={r.label} className={i === rangeIdx ? 'active' : ''} onClick={() => setRangeIdx(i)}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="charts-col">
                <div className="chart-block">
                    <h4> Price | Bollinger(20,2) | Vol | Fibonacci </h4>
                    <CandleChart candles={candles} />
                </div>
                <div className="chart-block">
                    <h4>MACD (12,26,9)</h4>
                    <MACDChart candles={candles} />
                </div>
            </div>
            <div className="side-col">
                <Fundamentals data={fund}></Fundamentals>
            </div>
        </div>
    );
}