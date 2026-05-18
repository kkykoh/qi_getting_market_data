from config.settings import TOP_N_OPPORTUNITIES

def rank_opportunities(results):

    # accounts for empty imput or missing keys
    if not results: 
        return []
    
    ranked = sorted(results, key=lambda x: x.get("Sharpe", float("-inf")), reverse=True)

    return ranked[:TOP_N_OPPORTUNITIES]