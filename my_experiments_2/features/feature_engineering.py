import numpy as np
import pandas as pd
from config.settings import MOMENTUM_WINDOW, VOLATILITY_WINDOW, RSI_WINDOW

def compute_features(df):
    df = df.copy()

    print("copy done")

    # Momentum - rolling return over winodw
    df["Momentum"] = df["Close"].pct_change(MOMENTUM_WINDOW)

    #VOLATILITY - rolling std of daily returns
    df["Volatility"] = df["Return"].rolling(VOLATILITY_WINDOW).std()
    print("Volatility done")

    # rsi

    print(type(df["Close"]))
    print(df["Close"].head())
    print(df.columns)

    close = df["Close"].squeeze()
    high = df["High"].squeeze()
    low = df["Low"].squeeze()

    print(type(df["Close"]))
    print(df["Close"].head())

    delta = df["Close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain=gain.rolling(RSI_WINDOW).mean()
    avg_loss = loss.rolling(RSI_WINDOW).mean()
    rs = avg_gain/avg_loss.replace(0, np.nan)
    df["RSI"] = 100 - (100 / (1+rs))

    # df["SMA50"] = df["Close"].rolling(50).mean()
    # df["SMA200"] = df["Close"].rolling(200).mean()
    # df["Mom_3M"] = df["Close"].pct_change(63)
    # df["Mom_6M"] = df["Close"].pct_change(126)
    # df["Mom_12M"] = df["Close"].pct_change(252)
    # df["Vol_3M"] = df["Return"].rolling(63).std() * np.sqrt(252)
    # df["High_52W"] = df["Close"].rolling(252).max()
    # df["Low_52W"] = df["Close"].rolling(252).min()
    # df["Pct_From_High"] = df["Close"] /  df["High_52W"]
    # df["Pct_From_Low"] = df["Close"] /  df["Low_52W"]

    # Trend / momentum
    df["SMA50"] = close.rolling(50).mean()
    df["SMA200"] = close.rolling(200).mean()  # probably intended 200, not 520

    df["Mom_3M"] = close.pct_change(63)
    df["Mom_6M"] = close.pct_change(126)
    df["Mom_12M"] = close.pct_change(252)

    df["Vol_3M"] = df["Return"].rolling(63).std() * np.sqrt(252)

    # 52-week levels
    df["High_52W"] = close.rolling(252).max()
    df["Low_52W"] = close.rolling(252).min()

    df["Pct_From_High"] = close / df["High_52W"]
    df["Pct_From_Low"] = close / df["Low_52W"]

    # ATR14 on weekly equivalent
    # high_low = df["High"] - df["Low"]
    # high_close = (df["High"] - df["Close"].shift()).abs()
    # low_close = (df["Low"] - df["Close"].shift()).abs()

    high_low = high - low
    high_close = (high - close.shift()).abs()
    low_close = (low - close.shift()).abs()
    tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    df["ATR14"] = tr.rolling(14).mean()

    return df.dropna()