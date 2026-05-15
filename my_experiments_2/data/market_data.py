import yfinance as yf

def download_data(ticker, start, end):

    df = yf.download(ticker, start=start, end=end, progress=False)

    # accounts for if ticker is invalid/delisted - error handling
    if df.empty:
        raise ValueError(f"No data return for {ticker}")
    
    df["Return"] = df["Close"].pct_change()

    return df.dropna()