def momentum_signal(df):

    df = df.copy()

    df["Signal"] = 0

    df.loc[df["Momentum"] > 0.05, "Signal"] = 1
    df.loc[df["Momentum"] < -0.05, "Signal"] = -1

    return df