from risk.risk_metrics import summarize_metrics
import traceback

def run_backtest(df):

    try:
        print("hello")
        df["Strategy_Return"] = df["Signal"].shift(1) * df["Return"]
        df["Strategy"] = (1 + df["Strategy_Return"]).cumprod()
        df["Buy_Hold"] = (1 + df["Return"]).cumprod()
    except Exception as e:
        print(f"Warning: failed - {e}")
        traceback.print_exc()

    return df

# def print_backtest_summary(df, ticker):
    # strategy_returns = df["Strategy_Return"].dropna()
    # buy_hold_returns = df["Return"].dropna()

    # print (f"\n{'='*30}")
    # print (f"{ticker} back test results")
    # print (f"\n{'='*30}")

    # print("\n strategy:")
 
    # for k, v in summarize_metrics(strategy_returns).items():
    #     print(f" {k:<20} {v}")
    
    # print(" \n buy and hold:")
    # for k, v in summarize_metrics(buy_hold_returns).items():
    #     print(f" {k:<20} {v}")

    # print (f"\n{'='*30}")

def print_backtest_summary(df, ticker):
    try:
        print("entered summary")

        strategy_returns = df["Strategy_Return"].dropna()
        buy_hold_returns = df["Return"].dropna()

        print("returns extracted")

        strategy_metrics = summarize_metrics(strategy_returns)
        print("strategy metrics computed")

        buy_hold_metrics = summarize_metrics(buy_hold_returns)
        print("buyhold metrics computed")

        print(f"\n{'='*30}")
        print(f"{ticker} back test results")
        print(f"\n{'='*30}")

        for k, v in strategy_metrics.items():
            print(f"{k}: {v}")

        for k, v in buy_hold_metrics.items():
            print(f"{k}: {v}")

    except Exception:
        import traceback
        traceback.print_exc()
        raise