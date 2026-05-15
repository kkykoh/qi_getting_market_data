import numpy as np

def generate_signals(df):

    df = df.copy()
    
    df["Signal"] = 0

    df.loc[df["Prediction"] > 0.002, "Signal"] = 1
    df.loc[df["Prediction"] < -0.002, "Signal"] = -1

    return df