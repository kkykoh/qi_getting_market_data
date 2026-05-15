def run_backtest(df):

    df["Strategy_Return"] = df["Signal"].shift(1) * df["Return"]

    df["Strategy"] = (1 + df["Strategy_Return"]).cumprod()

    return df