import yfinance as yf

def download_data(ticker, start, end):

    df = yf.download(ticker, start=start, end=end)

    df["Return"] = df["Close"].pct_change()

    return df.dropna()