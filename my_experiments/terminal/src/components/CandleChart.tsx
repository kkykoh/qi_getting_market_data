// import { ColorType, createChart, type IChartApi } from "lightweight-charts";
import { ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import type { Candle } from "../types";
import { bollinger, fibRetracement } from "../indicators";

export default function CandleChart({candles}: {candles: Candle[]}) {
    const ref = useRef<HTMLDivElement>(null);
    // const chartRef = useRef<IChartApi | null>(null);

    useEffect(()=> {
        if (!ref.current || !candles.length) return;
        const chart = createChart(ref.current, {
            layout: {
                background: { type: ColorType.Solid, color:'#0a0a0a'}, textColor: '#ddd'
            },
            grid: { vertLines: {color:'#1a1a1a'}, horzLines:{color:'#1a1a1a'}},
            width: ref.current.clientWidth, height:360,
            timeScale: {timeVisible: true, borderColor: '#333'},
            rightPriceScale: {borderColor:'#333'},
        });
        // chartRef.current = chart;

        const candleSeries = chart.addCandlestickSeries({
            upColor:'#4ade80', downColor:'#f87171',
            borderUpColor:'#4ade80', borderDownColor:'#f87171', wickUpColor:'#26a69a', wickDownColor:'#ef5350',
        });
        const volSeries = chart.addHistogramSeries({
            priceFormat: {type:'volume'}, priceScaleId:'vol',
            color:'#3a3a3a',
        });
        chart.priceScale('vol').applyOptions({scaleMargins: { top: 0.8, bottom: 0}});

        const toTime =(d:any) => Math.floor(new Date(d).getTime()/1000) as any;
        candleSeries.setData(candles.map(c => ({
            time: toTime(c.date), open: c.open, high: c.high, low: c.low, close: c.close,
        })));
        volSeries.setData(candles.map(c => ({
            time: toTime(c.date), value:c.volume, color: c.close >= c.open ?  'rgbq(38.166,154, 0.5': 'rgba(239, 83, 80, 0.5)',
        })));

        const bb = bollinger(candles);
        const upperS = chart.addLineSeries({color: '#5a8dee', lineWidth:1});
        const midS = chart.addLineSeries({color: '#888', lineWidth:1});
        const lowerS = chart.addLineSeries({color: '#5a8dee', lineWidth:1});

        upperS.setData(bb.filter(b=> !isNaN(b.upper)).map(b => ({
            time: toTime(b.time), value: b.upper
        })));
        midS.setData(bb.filter(b=> !isNaN(b.middle)).map(b => ({
            time: toTime(b.time), value: b.middle
        })));
        lowerS.setData(bb.filter(b=> !isNaN(b.lower)).map(b => ({
            time: toTime(b.time), value: b.lower
        })));

        const fib = fibRetracement(candles)
        if (fib) {
            fib.levels.forEach(l => {
                candleSeries.createPriceLine({
                    price: l.price,
                    color: 'rbga(255,200,0,0.55',
                    lineWidth:1,
                    lineStyle:2,
                    axisLabelVisible: true,
                    title:`Fib ${(l.ratio * 100).toFixed(1)}%`,
                });
            });
        }

        const onResize = () => chart.applyOptions({width : ref.current!.clientWidth});
        window.addEventListener('resize', onResize);
        return ()=> {window.removeEventListener('resize',onResize); chart.remove()}; 
    }, [candles]);

    return <div ref={ref} className="chart" />;

}