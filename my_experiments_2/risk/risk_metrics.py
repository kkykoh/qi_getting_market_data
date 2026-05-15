import numpy as np

def sharpe_ratio(returns):

    return (returns.mean()/returns.std()) * np.sqrt(252)