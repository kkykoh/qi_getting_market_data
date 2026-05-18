from pipeline import run_pipeline
from config.settings import START_DATE

def main():
    print("\n"+"="*30)
    print("personal quant terminal")
    print("\n"+"="*30)

    raw = input("\n Enter ticker(s), comma separated (eg, AAPL, MSFT): ").strip()
    tickers = [t.strip().upper() for t in raw.split(",") if t.strip()]

    if not tickers:
        print("no tickers added... exiting")
        return
    
    use_default=input(f"\nUse default start date ({START_DATE})? [Y/n]").strip().lower()
    start = START_DATE if use_default !="n" else input("enter start date (YYYY-MM-DD): ").strip()

    results={}

    for ticker in tickers:
        try:
            results[ticker] = run_pipeline(ticker, start=start)
        except Exception as e:
            print(f"\n Warning: failed for {ticker} -  {e}")

    print("All done \n")    
    return results

if __name__=="__main__":
    main()