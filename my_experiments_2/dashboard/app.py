import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st
import plotly.graph_objects as go
from pipeline import run_pipeline
from config.settings import START_DATE

st.set_page_config(page_title="Personal Quant Termianl", layout="wide")
st.title("Personal Quant Terminal")

ticker = st.text_input("Ticker", "AAPL").upper().strip()
start = st.text_input("Start date", START_DATE)

if st.button("Analyze") and ticker:
    with st.spinner(f"Running pipeline for {ticker}...."):
        out = run_pipeline(ticker, start=start)
        df, rec = out["df"], out["rec"]

        color = {"BUY": "green", "SELL": "red", "HOLD": "grey"}[rec["action"]]

        c1,c2,c3,c4 = st.columns(4)
        c1.metric("Price", f"${rec['price']:.2f}")
        c2.metric("Action", rec["action"])
        c3.metric("Confidence", rec["confidence"])
        c4.metric("ML 3M forecase", f"{rec['ml_forecase_3M']}$")

        fig = go.Figure()
        fig.add_trace(go.Candlestick(x=df.index, open = df["Open"], high = df["High"], low=df["Low"], close=df["Close"], name="Price"))
        fig.add_trace(go.Scatter(x=df.index, y=df["SMA200"], name="SMA200", line=dict(width=1)))

        for label, lvl in rec["rule_buy_zone"].items():
            fig.add_hline(y=lvl, line_dash="dot", line_color="green",annotation_text=f"buy: {label} ${lvl}")

        for label, lvl in rec["rule_sell_zone"].items():
            fig.add_hline(y=lvl, line_dash="dot", line_color="red",annotation_text=f"sell: {label} ${lvl}")

        
        fig.add_hline(y=rec["ml_buy_target"], line_dash="dot", line_color="blue",annotation_text=f"ML Buy taget: ${rec['ml_buy_target']}")
        fig.add_hline(y=rec["ml_sell_target"], line_dash="dot", line_color="purple",annotation_text=f"ML Sell target: ${rec['ml_sell_target']}")
        fig.add_hline(y=rec["stop_loss"], line_dash="dot", line_color="orange",annotation_text=f"Stop loss: ${rec['stop_loss']}")

        fig.update_layout(height=600, xaxis_rangeslider_visible=False, title=f"{ticker} - {rec['horizon']}")
        st.plotly_chart(fig, use_container_width=True)

        left, right = st.columns(2)
        with left: 
            st.subheader("Tech Stats"); st.json(rec["stats"])
            st.subheader("Rule based zones")
            st.write("**Buy:**", rec["rule_buy_zone"])
            st.write("**Sell:**", rec["rule_sell_zone"])
            st.write(f"**Sell:** ${rec['stop_loss']}")
        
        with right: 
            st.subheader("Fundamentals"); st.json(rec["fundamentals"])
            st.metric("Valuation score(0..1)", rec["valuation_score"])



