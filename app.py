from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from qa_pipeline import search

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to dataset
DATA_PATH = "data/retail_sales_dataset.csv"

# Chat request model
class ChatRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "InsightPulse API is running ✅"}

@app.get("/debug")
def debug():
    try:
        df = pd.read_csv(DATA_PATH)
        return {"rows": len(df), "columns": df.columns.tolist()}
    except Exception as e:
        return {"error": str(e)}

@app.get("/kpis")
def kpis():
    try:
        df = pd.read_csv(DATA_PATH)
        df = df[df["Quantity"] > 0]
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
def gender_distribution():
    try:
        df = pd.read_csv(DATA_PATH)
        gender_counts = df["Gender"].value_counts().to_dict()
        return gender_counts
    except Exception as e:
        return {"error": str(e)}

@app.get("/forecast")
def forecast_revenue():
    from sklearn.linear_model import LinearRegression
    import numpy as np
    try:
        df = pd.read_csv(DATA_PATH)
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values("Date")
        daily_revenue = df.groupby("Date")["Total Amount"].sum().reset_index()
        daily_revenue = daily_revenue[daily_revenue["Total Amount"] > 0]
        daily_revenue.columns = ["ds", "y"]
        daily_revenue["t"] = np.arange(len(daily_revenue))
        X = daily_revenue[["t"]]
        y = daily_revenue["y"]
        model = LinearRegression()
        model.fit(X, y)
        future_t = np.arange(len(daily_revenue), len(daily_revenue) + 30).reshape(-1, 1)
        future_dates = pd.date_range(daily_revenue["ds"].iloc[-1] + pd.Timedelta(days=1), periods=30)
        preds = model.predict(future_t)
        forecast = pd.DataFrame({
            "ds": future_dates,
            "yhat": preds,
            "yhat_lower": preds * 0.95,
            "yhat_upper": preds * 1.05
        })
        return forecast.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        results = search(request.question, top_k=5)
        return {"answers": results}
    except Exception as e:
        return {"error": str(e)}