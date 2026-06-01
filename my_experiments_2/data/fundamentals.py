import yfinance as yf

def get_fundamentals(ticker):
    info = yf.Ticker(ticker).info or {}
    keys = [
        "shortName", "sector", "industry", "marketCap",
        "trailingPE", "forwardPE", "pegRatio", "priceToBook", 
        "dividendYield", "beta", "fiftyTwoWeekHigh", "fiftyTwoWeekLow",
        "earningsGrowth", "revenueGrowth", "profitMargins", "returnOnEquity",
        "debtToEquity", "freeCashFlow"
    ]

    return {k: info.get(k) for k in keys}