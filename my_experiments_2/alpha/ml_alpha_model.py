from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

def train_model(df):

    features = ["Momentum","Volatility","RSI"]

    df = df.copy()
    df["Target"]=df["Return"].shift(-1)
    df = df.dropna(subset=features + ["Target"])

    X = df[features]
    y = df["Target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    df["Prediction"] = model.predict(X)

    return df