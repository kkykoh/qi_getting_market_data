import numpy as np
from config.settings import MOMENTUM_WINDOW, VOLATILITY_WINDOW, RSI_WINDOW

def compute_features(df):
    df = df.copy()

    # Momentum - rolling return over winodw
    df["Momentum"] = df["Close"].pct_change(MOMENTUM_WINDOW)

    #VOLATILITY - rolling std of daily returns
    df["Volatility"] = df["Return"].rolling(VOLATILITY_WINDOW).std()

    # rsi
    delta = df["Return"]
    gain = delta.clip(lower=0)
    gain = delta.clip(upper=0)
    avg_gain=gain.rolling(RSI_WINDOW).mean()
    avg_loss = loss.rolling(RSI_WINDOW).mean()
    rs = avg_gain/avg_loss
    df["RSI"] = 100 - (100 / (1+rs))

    return df.dropna()
