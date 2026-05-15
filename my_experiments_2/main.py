from universe.core_universe import CORE_UNIVERSE
from universe.watchlist import WATCHLIST
from data.market_data import download_data
import yfinance as yf
from datetime import date

end = date.today().isoformat()

all_stocks = list(set(CORE_UNIVERSE + WATCHLIST))

# batch download all tickers into single call
raw = yf.download(all_stocks, start="2018-01-01", end=end, group_by="ticker")

for ticker in all_stocks:
    df = raw[ticker].copy()
    df["Return"] = df["Close"].pct_change()
    df = df.dropna()
    print(ticker, "data loaded")