export type Quote = {
    symbol: string;
    shortName?: string;
    longName?: string;
    regularMarketPrice?: number;
    regularMarketChangePercent?:number;
    regularMarketChange?: number;
    marketCap?: number;
    regularMarketVolume?: number;
};

export type Candle = {
    date: string | Date;
    open: number;
    high:number;
    low: number;
    close: number;
    volume: number;
};