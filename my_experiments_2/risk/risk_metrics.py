import numpy as np
from config.settings import RISK_FREE_RATE

def sharpe_ratio(returns, risk_free_rate=0.05):
    # optimize for risk free rate
    excess_returns = returns - risk_free_rate / 252
    return (excess_returns.mean()/excess_returns.std()) * np.sqrt(252)

def sortino_ratio(returns, risk_free_rate = RISK_FREE_RATE):
    excess = returns - risk_free_rate /252
    downside = excess[excess < 0].std()
    if downside==0:
        return float("nan")
    return (excess.mean() / downside) * np.sqrt(252)

def max_drawdown(returns):
    cumulative = (1+returns).cumprod()
    rolling_max = cumulative.cummax()
    drawdown = (cumulative - rolling_max) / rolling_max
    return drawdown.min()

def summarize_metrics(returns):
    return {
        "Sharpe ratio": round(sharpe_ratio(returns), 3),
        "Sortino ratio": round(sortino_ratio(returns), 3),
        "Max Drawdown": f"{round(max_drawdown(returns) * 100, 2)}%",
        "Total Return": f"{round(((1 + returns).prod() -1 ) * 100, 2)}%",
        "Annual Volatility": f"{round(returns.std() * np.sqrt(252) * 100, 2)}%",
        "Win Rate": f"{round((returns > 0 ).mean() * 100, 2)}%",
    }