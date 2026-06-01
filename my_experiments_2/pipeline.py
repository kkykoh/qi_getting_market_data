from data.market_data import download_data
from features.feature_engineering import compute_features
from alpha.ml_alpha_model import train_model
from signals.signal_engine import generate_signals
from backtest.backtest_engine import run_backtest
from config.settings import START_DATE
from datetime import date
from recommend.recommendation import build_recommendation

# def run_pipeline(ticker, start=START_DATE, end=date.today().isoformat()):
#     print(f"\n running pipeline for {ticker}...")

#     print(" [1/5] downloading data...")
#     df = download_data(ticker, start, end)

#     print(" [2/5] computing features...")
#     df = compute_features(df)

#     print(" [3/5] training alpha model...")
#     df = train_model(df)
    
#     print(" [4/5] generating signals...")
#     df = generate_signals(df)

#     print(" [5/5] running backtest...")
#     df = run_backtest(df)

#     return df

def run_pipeline(ticker, start=START_DATE, end=None):
    print(f"\n running pipeline for {ticker}...")

    end = end or date.today().isoformat()
    print(" [1/5] downloading data...")
    df = download_data(ticker, start, end)

    print(" [2/5] computing features...")
    df = compute_features(df)

    print(" [3/5] training alpha model...")
    df = train_model(df)
    
    print(" [4/5] generating signals...")
    df = generate_signals(df)

    print(" [5/5] running backtest...")
    df = run_backtest(df)

    rec = build_recommendation(df, ticker)

    return {"df": df, "rec": rec}