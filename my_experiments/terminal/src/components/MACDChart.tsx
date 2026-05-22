import { useEffect, useRef } from "react";
import type { Candle } from "../types";
import {createChart, ColorType } from 'lightweight-charts';
import {macd} from '../indicators'
export default function MACDChart({candles}: {candles: Candle[]} ) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current || !candles.length ) return;
        const chart = createChart(ref.current, {
            layout: { background: { type: ColorType.Solid, color: '#0a0a0a'}, textColor:'#ddd'},
            grid: { vertLines: {color:'#1a1a1a'}, horzLines: {color:'#1a1a1a'}},
            width: ref.current.clientWidth, height:180,
            timeScale: {timeVisible: true, borderColor:'#333'},
        });
        const m = macd(candles);
        const t = (d: any) => Math.floor(new Date(d).getTime()/1000) as any;
        const macdLine = chart.addLineSeries({ color:'#42a5f5', lineWidth:1});
        const sigLine = chart.addLineSeries({ color: '#ff9800', lineWidth:1});
        const hist = chart.addHistogramSeries();

        macdLine.setData(m.filter(x =>!isNaN(x.macd)).map(x => ({time: t(x.time), value: x.macd})));
        sigLine.setData(m.filter(x =>!isNaN(x.signal)).map(x => ({time: t(x.time), value: x.signal})));
        hist.setData(m.filter(x =>!isNaN(x.hist)).map(x => ({time: t(x.time), value: x.hist,
            color: x.hist >= 0 ? 'rgba(38,166,154,0.7)':'rgba(239.83,80,0.7)',
        })));
        const onR = () => chart.applyOptions({width: ref.current!.clientWidth});
        window.addEventListener('resize', onR);
        return () => {window.removeEventListener('resize',onR); chart.remove(); };
    },[candles]);
    return <div ref={ref} className="chart"/>;
}