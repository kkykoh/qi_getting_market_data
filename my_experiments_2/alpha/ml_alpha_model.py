from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import TimeSeriesSplit, train_test_split
import numpy as np
import pandas as pd

def train_model(df):

    features = ["Momentum","Volatility","RSI", 
                "Mom_3M", "Mom_6M", "Mom_12M", 
                "Vol_3M", "Pct_From_High", "Pct_From_Low"]

    FORWARD_DAYS = 63

    df = df.copy()

    if isinstance(df.columns, pd.MultiIndex):
            df.columns = [
                c[0] if isinstance(c, tuple) else c
                for c in df.columns
        ]

    df["Target"] = df["Close"].pct_change(FORWARD_DAYS).shift(-FORWARD_DAYS)

    print("Columns:")
    print(df.columns.tolist())

    print("Missing:")
    for c in features + ["Target"]:
        if c not in df.columns:
            print(c)

    df = df.dropna(subset=features + ["Target"])

        # walk forward: predict each fold's test slice only - prevent leakage
    df["Prediction"] = np.nan
    tscv = TimeSeriesSplit(n_splits=5)
    for tr_idx, te_idx in tscv.split(df):
            model = RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=-1)
            model.fit(df[features].iloc[tr_idx], df["Target"].iloc[tr_idx])
            df.iloc[te_idx, df.columns.get_loc("Prediction")] = model.predict(df[features].iloc[te_idx])

        #final model train on all data - used for the latest forecasting
    final = RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=1)
    final.fit(df[features], df["Target"])
        
        # df.attrs carries latest forward-return forecase through to recommender without polluting columns
    df.attrs["latest_forecast"] = float(final.predict(df[features].iloc[[-1]])[0])
    df.attrs["models"] = final


        # df["Target"]=df["Return"].shift(-1)
        # df = df.dropna(subset=features + ["Target"])

        # X = df[features]
        # y = df["Target"]

        # X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

        # model = RandomForestRegressor(n_estimators=200, random_state=42)
        # model.fit(X_train, y_train)

        # df.loc[X_test.index, "Prediction"] = model.predict(X_test)

    return df