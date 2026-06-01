import numpy as np

def generate_signals(df):

    print("generate_signals received:", type(df))
    print(df is None)

    df = df.copy()
    
    # df["Signal"] = 0

    # df.loc[df["Prediction"] > 0.002, "Signal"] = 1
    # df.loc[df["Prediction"] < -0.002, "Signal"] = -1

    sigma = df["Prediction"].rolling(60, min_periods=20).std()
    z = df["Prediction"] / sigma
    df["Signal"] = np.where(z > 0.5, 1, np.where(z < -0.5, -1, 0))

    return df