import { acidTest } from "../indicators";

const fmt$ = (n?: number) => n == null ? '-':(Math.abs(n) >= 1e9 ? (n/1e9).toFixed(2)+'B' : (n/1e6).toFixed(1)+'M');
const v = (x:any) => typeof x === 'object' ? x?.raw :x;

export default function Fundamentals({data}: {data:any}) {
    if (!data) return null;
     const profile = data.summaryProfile;
     const fin = data.financialData;
     const inc = data.incomeStatementHistory?.incomeStatementHistory?.[0];
     const bsq = data.balanceSheetHistoryQuarterly?.balanceSheetStatements?.[0];
     const stats = data.defaultKeyStatistics;
     const acid = acidTest(bsq);

     return (
        <div className="fundamentals">
            <section>
                <h3>
                    Business/Product
                </h3>
                <p className="biz">
                    {profile.longBusinessSummary ?? 'No Description'}
                </p>
                <div className="meta">
                    <span>Sector: {profile?.sector ?? '-'}</span>
                    <span>Industry: {profile?.industry ?? '-'}</span>
                    <span>Employees: {profile?.fullTimeEmployees?.toLocaleString() ?? '-'}</span>
                </div>
                <p className="caveat">
                    Note: free yahoo data doesnt expose product level revenue segmentations. showing top line icome statement instead.
                </p>
                </section>
                <section>
                    <h2>most recent annual income</h2>
                    <table className="kv">
                        <tbody>
                            <tr><td>Total Revenue</td><td>${fmt$(v(inc?.totalRevenue))}</td></tr>
                            <tr><td>Cost of Revenue</td><td>${fmt$(v(inc?.costOfRevenue))}</td></tr>
                            <tr><td>Gross Profit</td><td>${fmt$(v(inc?.grossProfit))}</td></tr>
                            <tr><td>Operating Income</td><td>${fmt$(v(inc?.operatingIncome))}</td></tr>
                            <tr><td>Net Income</td><td>${fmt$(v(inc?.netIncome))}</td></tr>
                        </tbody>
                    </table>
                </section>
                <section>
                    <h2>liquiduty and ratios</h2>
                    <table className="kv">
                        <tbody>
                            <tr><td>Acid test ratio</td><td>{acid != null ? acid.toFixed(2):'-'}</td></tr>
                            <tr><td>Current Ratio</td><td>{fin?.currentRation?.toFixed(2) ??'-'}</td></tr>
                            <tr><td>Debt To Equity Ratio</td><td>{fin?.debtToEquity?.toFixed(2) ??'-'}</td></tr>
                            <tr><td>Profit Margin</td><td>{fin?.profitMargins ? (fin?.profitMargins*100).toFixed(2)+'%': '-'}</td></tr>
                            <tr><td>P/E (trailing)</td><td>{stats?.trainlinePE?.toFixed(2) ??'-'}</td></tr>
                            <tr><td>Beta</td><td>{stats?.beta?.toFixed(2) ??'-'}</td></tr>
                        </tbody>
                    </table>
                </section>
        </div>
     );
}