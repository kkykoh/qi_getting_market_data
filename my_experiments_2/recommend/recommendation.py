import numpy as np
import pandas as pd
from data.fundamentals import get_fundamentals

def _valuation_score(f):
    print("valutation...")
    """Heuristic 0..1 - higher is better for long position"""
    score, n = 0.0, 0
    pe = f.get("trailingPE")
    if pe and pe > 0:
        score += np.clip((30-pe) / 25, 0, 1); n+= 1 #cheaper PE --> HIGHER

    peg = f.get("pegRatio")
    if peg and peg > 0 :
        score += np.clip((2-peg) / 1.5, 0, 1); n += 1
    
    roe  = f.get("returnOnEquity")
    if roe is not None:
        score += np.clip(roe / 0.25, 0, 1); n += 1
    de = f.get("debtToEquity");
    if de is not None:
        score += np.clip((150-de) / 150, 0, 1); n +=1
    return score /n if n else 0.5

def build_recommendation(df, ticker):
    print("build recs")
    last = df.iloc[-1]
    price = float(last["Close"])
    atr = float(last["ATR14"])
    sma50, sma200 = float(last["SMA50"]), float(last["SMA200"])
    hi52, lo52 = float(last["High_52W"]), float(last["Low_52W"])

    f = get_fundamentals(ticker)
    val = _valuation_score(f)
    pred_fwd = df.attrs.get("latest_forecase", 0.0) # ~3M Forward return 

    # Rules-based zone (tech)
    rule_buy = {
        "aggressive": price - 1.0 * atr,
        "ideal": max(sma50, lo52 + 0.10 * (hi52 - lo52)),
        "deep_value": sma200,
    }

    rule_sell = {
        "first_target": price +2.0 *atr,
        "ideal": hi52,
        "extended": price * 1.25,
    }

    stop_loss = price - 1.5*atr

    # ML implied target
    ml_target_price = price * (1 + pred_fwd)
    ml_buy = ml_target_price * 0.95 # 5% buffer below ML target
    ml_sell = ml_target_price * 1.00

    # Action
    trend_up = price > sma200 and sma50 > sma200
    near_support = price <= rule_buy["deep_value"] * 1.03
    near_resist = price >= hi52 * 0.97

    if pred_fwd > 0.05 and trend_up and (near_support or val > 0.6):
        action, conf = "BUY", min(1.0, 0.4 + pred_fwd * 4 + val *0.3)
    elif pred_fwd < -0.05 and (near_resist or val < 0.4):
        action, conf = "SELL", min(1.0, 0.4 + abs(pred_fwd) * 4 + (1-val) * 0.3)
    else: action, conf = "HOLD", 0.5


    return {
        "ticker" : ticker,
        "price": price,
        "action": action,
        "confidence": round(conf, 3),
        "horizon": "circa 3 months",
        "stats": {
            "RSI": round(float(last["RSI"]), 1),
            "Mom_3M": round(float(last["Mom_3M"]) * 100, 1),
            "Mom_12M": round(float(last["Mom_12M"]) * 100, 1),
            "Vol_3M_ann": round(float(last["Vol_3M"]) * 100, 1),
            "Percent change from 52W High": round(float(last["Pct_From_High"]) * 100,1),
            "SMA50": round(sma50,2),
            "SMA200": round(sma200, 2),
            "ATR14": round(atr,2)
        },
        "fundamentals" : f,
        "valuation_score": round(val, 3),
        "ml_forecase_3M" : round(pred_fwd * 100, 4),
        "rule_buy_zone": { k: round(v,2) for k,v in rule_buy.items()},
        "rule_sell_zone": { k: round(v,2) for k,v in rule_sell.items()},
        "ml_buy_target": round(ml_buy, 3),
        "ml_sell_target": round(ml_sell, 2),
        "stop_loss": round(stop_loss, 2)

    }
    