export type Industry = {
    key: string;
    label: string;
    group: string;
    tickers: string[];
};

export const INDUSTRIES: Industry[] = [
    {key: 'quantum', label: 'quantum computing', 'group':'specialized', tickers: ['IONQ','RGTI','QBTS','QUBT']},
];

export const findIndustry = (k: string) => INDUSTRIES.find(i => i.key === k);

export const allTickers = () => INDUSTRIES.flatMap(i => i.tickers);