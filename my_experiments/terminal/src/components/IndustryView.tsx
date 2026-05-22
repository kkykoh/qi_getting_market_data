import { useEffect, useState } from "react";
import { INDUSTRIES } from "../industries";
import type { Quote } from "../types";
// import { fetchQuotes } from "../api";
import { fetchQuotes, fetchUniverse } from "../api";

export default function IndustryView({ industryKey, onPickTicker }: {
    industryKey: string; onPickTicker: (s: string) => void;
}) {
    // const ind = findIndustry(industryKey);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [tickers, setTickers] = useState<string[]>([]);
    const [label, setLabel] = useState(industryKey);

    useEffect(()=> {
        // if (!ind) return;
        // fetchQuotes(ind.tickers).then(setQuotes);
        const themed = INDUSTRIES.find(i => i.key === industryKey);
        if (themed) { setTickers(themed.tickers);
            setLabel(themed.label); 
            return;
        } fetchUniverse().then(u => {
            const rows = u.sectors[industryKey] ?? [];
            setTickers(rows.map(r => r.symbol));
            setLabel(industryKey);
        });
    }, [industryKey]);

    useEffect(()=> {
        if (tickers.length) fetchQuotes(tickers).then(setQuotes);
    }, [tickers]);

    // if (!ind) return <div> Unknown Industry</div>;

    return (
        <div className="industry">
            <h2>{label}</h2>
            {!tickers.length && <div className="loading">No constituents found.</div>}
            <table className="constituent-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Change/Delta</th>
                        <th>%</th>
                        <th>Market Cap</th>
                        <th>Volume</th>
                    </tr>
                </thead>
                <tbody>
                    {quotes.map(q => {
                        const up = (q.regularMarketChangePercent ?? 0) >=0;
                        return (
                            <tr key={q.symbol} onClick={() => onPickTicker(q.symbol)}>
                                <td><strong>{q.symbol}</strong></td>
                                <td>{q.longName ?? q.shortName}</td>
                                <td>{q.regularMarketPrice?.toFixed(2)}</td>
                                <td className={up ? 'pos':'neg'}>{q.regularMarketChange?.toFixed(2)}</td>
                                <td className={up ? 'pos':'neg'}>{q.regularMarketChangePercent?.toFixed(2)}%</td>
                                <td>{q.marketCap ? (q.marketCap/1e9).toFixed(2) + 'B': '-'}</td>
                                <td>{q.regularMarketVolume?.toLocaleString()}</td>
                            </tr>
                        );
                    })};
                </tbody>
            </table>
        </div>
    );
}