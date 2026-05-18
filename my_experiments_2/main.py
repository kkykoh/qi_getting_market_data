from universe.core_universe import CORE_UNIVERSE
from universe.watchlist import WATCHLIST
import yfinance as yf
from datetime import date
from config.settings import START_DATE

end = date.today().isoformat()

CUSTOM = ["BMNR","COIN","HOOD","BKSY"]

all_stocks = list(set(CORE_UNIVERSE + WATCHLIST + CUSTOM))

# batch download all tickers into single call
raw = yf.download(all_stocks, start=START_DATE, end=end, group_by="ticker")

for ticker in all_stocks:
    df = raw[ticker].copy()
    df["Return"] = df["Close"].pct_change()
    df = df.dropna()
    print(ticker, "data loaded")