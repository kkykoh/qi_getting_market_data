import { useEffect, useMemo, useState } from "react";
import { INDUSTRIES } from "../industries";
import { fetchQuotes, addTicker, fetchUniverse, removeTicker, type Universe } from '../api';
import type { Quote } from "../types";

const colorFor = (pct: number | undefined) => {
    if (pct == null || isNaN(pct)) return '#222';
    const clamp = Math.max(-5, Math.min(5, pct));
    const intensity = Math.abs(clamp) / 5;
    if (clamp >= 0) return `rgba(0, ${Math.round(180 + 60 * intensity)}, 80, ${0.225 + 0.7 * intensity})`;
    else return `rgba(${Math.round(180 + 60 * intensity)}, 40, 40, ${0.225 + 0.7 * intensity})`;
};

type Mode = 'sectors' | 'themes';

export default function HeatMap({ onPickIndustry }: { onPickIndustry: (k: string) => void }) {
    const [quotes, setQuotes] = useState<Record<string, Quote>>({});
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<Mode>('sectors');
    const [universe, setUniverse] = useState<Universe>({ sectors: {}, userTickers: [] });
    const [showAdd, setShowAdd] = useState(false);
    const [newSym, setNewSym] = useState('');
    const [newSector, setNewSector] = useState('');

    // useEffect(() => {
    //     const all = INDUSTRIES.flatMap(i => i.tickers);
    //     fetchQuotes(all).then(qs => {
    //         const m: Record<string, Quote> = {};
    //         qs.forEach (q => { m[q.symbol] = q});
    //         setQuotes(m);
    //         setLoading(false);
    //     });
    // }, []);

    // const industryAvg = (tickers: string[]) => {
    //     const ps = tickers.map (t => quotes[t]?.regularMarketChangePercent).filter(p => p != null) as number[];
    //     if (!ps.length) return undefined;
    //     return ps.reduce((a,b) => a+b, 0) / ps.length;
    // };

    useEffect(() => {
        fetchUniverse().then(u => {
            console.log("universe loaded:", Object.keys(u.sectors).length, 'sectors');
            setUniverse(u);
        });
    }, []);

    const groups = useMemo(() => {
        if (mode === 'sectors') {
            return Object.entries(universe.sectors).map(([key, rows]) => ({
                key,
                label: key,
                tickers: rows.map(r => r.symbol),
            }));
        }
        return INDUSTRIES.map(i => ({
            key: i.key,
            label: i.label,
            tickers: i.tickers
        }));
    }, [mode, universe]);

    const allTickers = useMemo(() =>
        Array.from(new Set(groups.flatMap(g => g.tickers))),
        [groups]
    );

    useEffect(() => {
        if (!allTickers.length) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const CHUNK = 50;
        (async () => {
            const m: Record<string, Quote> = {};
            for (let i = 0; i < allTickers.length; i += CHUNK) {
                const batch = await fetchQuotes(allTickers.slice(i, i + CHUNK));
                batch.forEach((q: { symbol: any; shortName?: string | undefined; longName?: string | undefined; regularMarketPrice?: number | undefined; regularMarketChangePercent?: number | undefined; regularMarketChange?: number | undefined; marketCap?: number | undefined; regularMarketVolume?: number | undefined; }) => { if (q?.symbol) m[q.symbol] = q; });
                setQuotes({ ...m });
            }
            setLoading(false);
        })();
    }, [allTickers.join(',')]);

    const avg = (ts: string[]) => {
        const ps = ts.map(t => quotes[t]?.regularMarketChangePercent)
            .filter(p => p != null) as number[];
        return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : undefined;
    };

    const submitAdd = async () => {
        if (!newSym || !newSector) return;
        await addTicker(newSym.toUpperCase(), newSector);
        setShowAdd(false);
        setNewSym('');
        setNewSector('');
        fetchUniverse().then(setUniverse);
    }

    const sectorOptions = useMemo(() => Object.keys(universe.sectors), [universe]);

    // if (loading)
    //     return <div className="loading">Loading Market Data...</div>;

    //     return (
    //         <div className="heatmap">
    //             {['specialized', 'standard'].map(group => (
    //                 <section key={group}>
    //                     <h2>
    //                         {group === 'specialized' ? 'FOCUS SECTORS' : 'STANDARD SECTORS'}
    //                     </h2>
    //                     <div className="industry-grid">
    //                         {INDUSTRIES.filter(i => i.group === group).map(ind => {
    //                             const avg = industryAvg(ind.tickers);
    //                             return (
    //                                 <div key={ind.key} className="industry-card" onClick={() => onPickIndustry(ind.key)}
    //                                     style={{ borderColor: colorFor(avg) }}>
    //                                     <div className="ind-head" style={{ background: colorFor(avg) }}>
    //                                         <span>{ind.label}</span>
    //                                         <span>{avg != null ? `${avg.toFixed(2)}%` : '-'}</span>
    //                                     </div>
    //                                     <div className="constituents">
    //                                         {ind.tickers.map(t => {
    //                                             const q = quotes[t];
    //                                             const p = q?.regularMarketChangePercent;
    //                                             return (
    //                                                 <div key={t} className="ticker-cell" style={{ background: colorFor(p) }} title={q?.longName ?? t}>
    //                                                     <strong>{t}</strong>
    //                                                     <span> {p != null ? `${p.toFixed(2)}%` : '-'}</span>
    //                                                 </div>
    //                                             );
    //                                         })}
    //                                     </div>
    //                                 </div>
    //                             );
    //                         })}
    //                     </div>
    //                 </section>
    //             ))}
    //         </div>
    //     );

    return (
        <div className="heatmap">

            <div className="heatmap-controls">
                <div className="seg">
                    <button className={mode === 'sectors' ? 'active' : ''}
                        onClick={() => setMode('sectors')}>
                        S&amp;P 500 Sectors
                    </button>
                    <button className={mode === 'themes' ? 'active' : ''}
                        onClick={() => setMode('themes')}>
                        THEMES
                    </button>
                    <button className="add-btn" onClick={() => setShowAdd(true)}> + ADD TICKER</button>
                </div>
                {loading && <div className="loading"> Loading...</div>}
                {!loading && groups.length === 0 && (
                    <div className="loading">
                        No data. Check that api works.
                    </div>
                )}
            </div>
            <div className="industry-grid">
                {groups.map(g => {
                    const a = avg(g.tickers);
                    return (
                        <div key={g.key} className="industry-card"
                            onClick={() => onPickIndustry(g.key)}
                            style={{ borderColor: colorFor(a) }}>
                            <div className="ind-head" style={{ background: colorFor(a) }}>
                                <span>{g.label}</span>
                                <span>{a != null ? `${a.toFixed(2)}%` : '-'}</span>
                            </div>
                            <div className="constituents">
                                {g.tickers.slice(0, 18).map(t => {
                                    const q = quotes[t];
                                    const p = q?.regularMarketChangePercent;
                                    return (
                                        <div key={t} className="ticker-cell" style={{ background: colorFor(p) }} title={q?.longName ?? t}>
                                            <strong>{t}</strong>
                                            <span> {p != null ? `${p.toFixed(2)}%` : '-'}</span>
                                        </div>
                                    );
                                })}
                                {g.tickers.length > 18 && (
                                    <div className="ticker-cell more">+{g.tickers.length - 18}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showAdd && (
                <div className="modal-bg" onClick={() => setShowAdd(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Add Ticker</h3>
                        <label>
                            Symbol
                            <input value={newSym} onChange={e => setNewSym(e.target.value)}
                                placeholder="NVDA"></input>
                        </label>
                        <label>
                            Sector
                            <input list="sectors" value={newSector} onChange={e => setNewSector(e.target.value)}
                                placeholder="Informtaion Technology"></input>

                            <datalist id="sectors">
                                {sectorOptions.map(s => <option key={s} value={s} />)}
                            </datalist>
                        </label>
                        <div className="modal-actions">
                            <button onClick={() => setShowAdd(false)}>Cancel</button>
                            <button className="primary" onClick={submitAdd}>Add</button>
                        </div>
                        {universe.userTickers.length > 0 && (
                            <>
                                <h4>Your additions</h4>
                                <ul className="user-list">
                                    {universe.userTickers.map(u => (
                                        <li key={u.symbol}>
                                            <span> {u.symbol} <em> {u.sector}</em>
                                            </span>
                                            <button onClick={async () => {
                                                await removeTicker(u.symbol);
                                                fetchUniverse().then(setUniverse);
                                            }}
                                            >
                                                x
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                    </div>
                </div>
            )}

            {/* <section key={group}>
                <h2>
                    {group === 'specialized' ? 'FOCUS SECTORS' : 'STANDARD SECTORS'}
                </h2>
                <div className="industry-grid">
                    {INDUSTRIES.filter(i => i.group === group).map(ind => {
                        const avg = industryAvg(ind.tickers);
                        return (
                            <div key={ind.key} className="industry-card" onClick={() => onPickIndustry(ind.key)}
                                style={{ borderColor: colorFor(avg) }}>
                                <div className="ind-head" style={{ background: colorFor(avg) }}>
                                    <span>{ind.label}</span>
                                    <span>{avg != null ? `${avg.toFixed(2)}%` : '-'}</span>
                                </div>
                                <div className="constituents">
                                    {ind.tickers.map(t => {
                                        const q = quotes[t];
                                        const p = q?.regularMarketChangePercent;
                                        return (
                                            <div key={t} className="ticker-cell" style={{ background: colorFor(p) }} title={q?.longName ?? t}>
                                                <strong>{t}</strong>
                                                <span> {p != null ? `${p.toFixed(2)}%` : '-'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section> */}

        </div>
    );

}