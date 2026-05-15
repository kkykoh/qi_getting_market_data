from sklearn.ensemble import RandomForestRegressor

def train_model(df):

    features = ["Momentum","Volatility","RSI"]

    X = df[features]
    y = df["Return"].shift(-1)

    model = RandomForestRegressor(n_estimators=200)

    model.fit(X, y)

    df["Prediction"] = model.predict(X)

    return df