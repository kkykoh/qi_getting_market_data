import express from 'express';
import YahooFinance from 'yahoo-finance2';
import { getSP500, groupBySector } from './universe';
import { readUser, addUser, removeUser } from './userStore';

// yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

const app = express();

const yahooFinance = new YahooFinance();

app.get('/api/quotes', async (req, res) => {
    const symbols = String(req.query.symbols || '').split(',').filter(Boolean);
    if (!symbols.length) return res.json([]);
    // try {
    //     const data = await yahooFinance.quote(symbols);
    //     res.json(Array.isArray(data) ? data : [data] );
    // } catch (e: any) {
    //     res.status(400).json({error: e.message})
    // }
    const results = await Promise.allSettled(
        symbols.map(s => yahooFinance.quote(s, {}, {validateResult: false}))
    );
    const ok = results.map((r, i) => r.status === 'fulfilled' ? r.value : { symbol: symbols[i], _failed: true})
    .filter(Boolean);
    res.json(ok);
});

app.get('/api/chart/:symbol', async(req, res) => {
    const {symbol} = req.params;
    const range = String(req.query.range || '6mo');
    const interval = String(req.query.interval || '1d');
    const periodMap: Record<string, number> = {
        '5d':5,
        '1mo':30,
        '3mo': 90,
        '6mo':180,
        '1y':365,
        '2y':730,
        '5y':1825,
    };
    const days = periodMap[range] ?? 180;
    const period1 = new Date(Date.now() - days * 86400_000);
    try {
        const r = await yahooFinance.chart(symbol, { period1, interval: interval as any} );
        res.json(r.quotes.filter(q => q.open != null));
    } catch (e: any) {
        res.status(500).json({error: e.message})
    };

});

app.get('/api/fundamentals/:symbol', async (req, res) => {
    try {
        const s = await yahooFinance.quoteSummary(req.params.symbol, {
            modules: [
                'summaryProfile', 'financialData', 'balanceSheetHistoryQuarterly',
                'incomeStatementHistory','defaultKeyStatistics','price',
            ],
        });
        res.json(s);
    } catch (e:any) {
        res.status(500).json({error: e.message});
    }
});

app.use(express.json());

app.get('/api/universe', async (_req, res) => {
    try {
        const sp = await getSP500();
        const user = await readUser();
        const merged = [...sp];
        for (const u of user) {
            if (!merged.find(x => x.symbol === u.symbol)) {
                merged.push({ symbol: u.symbol, name: u.symbol, sector: u.sector, subIndustry: 'User Added'});
            }
        }

        res.json({ sectors: groupBySector(merged), userTickers: user});
    } catch (e: any) {
        res.status(500).json({error: e.message});
    }
});

app.post('/api/tickers', async (req, res) => {
    const { symbol, sector } = req.body ?? {};
    if (!symbol || !sector ) return res.status(400).json({error:'symbol and sector required'});
    const list = await addUser({ symbol: String(symbol).toUpperCase(),
        sector: String(sector)
    });
    res.json(list);
});

app.delete('/api/tickers/:symbol', async (req, res) => {
    res.json(await removeUser(req.params.symbol.toUpperCase()));
});

const PORT = 8787;
app.listen(PORT, () => console.log(`api: ${PORT}`));