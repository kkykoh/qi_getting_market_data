def rank_opportunities(results):

    ranked = sorted(results, key=lambda x: x["Sharpe"], reverse=True)

    return ranked[:10]