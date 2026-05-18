from risk.risk_metrics import summarize_metrics

def run_backtest(df):

    df["Strategy_Return"] = df["Signal"].shift(1) * df["Return"]
    df["Strategy"] = (1 + df["Strategy_Return"]).cumprod()
    df["Buy_Hold"] = (1 + df["Return"]).cumprod()

    return df

def print_backtest_summary(df, ticker):
    strategy_returns = df["Strategy_Return"].dropna()
    buy_hold_returns = df["Return"].dropna()


    print (f"\n{'='*30}")
    print (f"{ticker} back test results")
    print (f"\n{'='*30}")

    print(" \n strategy:")

    for k,v,in summarize_metrics(strategy_returns).items():
        print(f" {k:<20} {v}")
    
    print(" \n buy and hold:")
    for k,v,in summarize_metrics(buy_hold_returns).items():
        print(f" {k:<20} {v}")

    print (f"\n{'='*30}")
