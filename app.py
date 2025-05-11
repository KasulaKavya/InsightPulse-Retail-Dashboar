# ✅ Enhanced app.py with Forecast Fix and Smart Q&A
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
from qa_pipeline import search

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = "data/retail_sales_dataset.csv"

@app.get("/")
def home():
    return {"message": "InsightPulse API is running ✅"}

@app.get("/kpis")
def kpis(request: Request):
    try:
        df = pd.read_csv(DATA_PATH)
        df = df[df["Quantity"] > 0]
        category = request.query_params.get("category")
        if category:
            df = df[df["Product Category"] == category]
        revenue = float(df["Total Amount"].sum())
        customers = int(df["Customer ID"].nunique())
        transactions = int(len(df))
        avg_basket = float((df["Total Amount"] / df["Quantity"]).mean())
        return {
            "revenue": round(revenue, 2),
            "customers": customers,
            "transactions": transactions,
            "avg_basket": round(avg_basket, 2)
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/sales-by-category")
def sales_by_category():
    try:
        df = pd.read_csv(DATA_PATH)
        category_sales = df.groupby("Product Category")["Total Amount"].sum().reset_index()
        return category_sales.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}

@app.get("/gender-distribution")
def gender_distribution(request: Request):
    try:
        df = pd.read_csv(DATA_PATH)
        category = request.query_params.get("category")
        if category:
            df = df[df["Product Category"] == category]
        gender_counts = df["Gender"].value_counts().to_dict()
        return gender_counts
    except Exception as e:
        return {"error": str(e)}

@app.get("/forecast")
def forecast_monthly(request: Request):
    try:
        df = pd.read_csv(DATA_PATH)
        df = df[df["Total Amount"].notna()]
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values("Date")

        category = request.query_params.get("category")
        if category:
            df = df[df["Product Category"] == category]

        df["Month"] = df["Date"].dt.to_period("M").dt.to_timestamp()
        monthly_revenue = df.groupby("Month")["Total Amount"].sum().reset_index()
        monthly_revenue.columns = ["ds", "y"]

        if monthly_revenue.empty or len(monthly_revenue) < 2:
            return {"error": "Not enough data to forecast."}

        monthly_revenue["t"] = np.arange(len(monthly_revenue))
        X = monthly_revenue[["t"]]
        y = monthly_revenue["y"]

        model = LinearRegression()
        model.fit(X, y)

        future_t = pd.DataFrame({
            "t": np.arange(len(monthly_revenue), len(monthly_revenue) + 6)
        })
        last_date = monthly_revenue["ds"].iloc[-1]
        future_dates = pd.date_range(last_date + pd.DateOffset(months=1), periods=6, freq="MS")

        preds = model.predict(future_t)
        forecast_df = pd.DataFrame({
            "ds": future_dates.strftime('%Y-%m'),
            "yhat": preds,
            "yhat_lower": preds * 0.95,
            "yhat_upper": preds * 1.05,
            "category": category if category else "All"
        })

        monthly_revenue["ds"] = monthly_revenue["ds"].dt.strftime('%Y-%m')
        historical = monthly_revenue.rename(columns={"y": "yhat"}).assign(
            yhat_lower=lambda d: d["yhat"] * 0.95,
            yhat_upper=lambda d: d["yhat"] * 1.05,
            category=category if category else "All"
        )

        combined = pd.concat([historical, forecast_df], ignore_index=True)
        combined = combined.replace([np.inf, -np.inf, np.nan], None)

        return combined.to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    question = body.get("question", "").strip().lower()

    try:
        df = pd.read_csv(DATA_PATH)

        if any(kw in question for kw in ["revenue", "sales total", "income"]):
            total = df["Total Amount"].sum()
            return {"answers": [f"📊 Total Revenue: ${total:,.2f}"]}

        elif any(kw in question for kw in ["customer", "unique buyers", "clients"]):
            count = df["Customer ID"].nunique()
            return {"answers": [f"🧑‍🤝‍🧑 Unique Customers: {count}"]}

        elif any(kw in question for kw in ["transaction", "orders", "purchases"]):
            return {"answers": [f"🧾 Total Transactions: {len(df)}"]}

        elif "top" in question and "category" in question:
            top = df.groupby("Product Category")["Total Amount"].sum().idxmax()
            return {"answers": [f"🏆 Top Selling Category: {top}"]}

        elif any(kw in question for kw in ["highest sales", "best month", "peak month"]):
            df["Month"] = pd.to_datetime(df["Date"]).dt.to_period("M")
            top_month = df.groupby("Month")["Total Amount"].sum().idxmax()
            return {"answers": [f"📅 Highest Sales Month: {top_month}"]}

        elif "table" in question and "show" in question:
            top5 = df.head(5)
            table = [
                f"{row['Transaction ID']}|{row['Date']}|{row['Customer ID']}|{row['Gender']}|{row['Age']}|{row['Product Category']}|{row['Quantity']}|{row['Price per Unit']}|{row['Total Amount']}"
                for _, row in top5.iterrows()
            ]
            return {"answers": table}

        else:
            matches = search(question)
            return {"answers": matches}

    except Exception as e:
        return {"answers": [f"Backend error: {str(e)}"]}

@app.get("/export")
def export_data():
    export_file = "data/exported_data.csv"
    df = pd.read_csv(DATA_PATH)
    df.to_csv(export_file, index=False)
    return FileResponse(export_file, filename="retail_report.csv")
