import numpy as np

def sharpe_ratio(returns, risk_free_rate=0.05):
    # optimize for risk free rate
    excess_returns = returns - risk_free_rate / 252
    return (excess_returns.mean()/excess_returns.std()) * np.sqrt(252)