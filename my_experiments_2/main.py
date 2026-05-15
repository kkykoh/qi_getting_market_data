from universe.core_universe import CORE_UNIVERSE
from universe.watchlist import WATCHLIST
from data.market_data import download_data

all_stocks = list(set(CORE_UNIVERSE + WATCHLIST))

for ticker in all_stocks:

    df = download_data(ticker, "2018-01-01", "2026-03-03")

    print(ticker, "data loaded")