# 🛍️ InsightPulse: Retail Analytics Dashboard with Chatbot & Forecasting

A dynamic, full-stack interactive dashboard built with React + FastAPI, using real-time data insights, chart visualizations, monthly forecasting, and a smart GPT-powered chatbot trained on retail sales data.

🚀 Features

- 📊 Visual KPIs: Real-time Revenue, Customers, Transactions, Average![Screenshot 2025-05-10 231216](https://github.com/user-attachments/assets/b30dfcc0-0958-448c-987e-35d6d8549faf)
 Basket
- 💼 Category Analytics: Bar charts for Sales by Product Category (clickable)
- 👥 Gender Split: Donut chart showing gender distribution
- 📈 Monthly Revenue Forecast: 2023–2024 predictions using Linear Regression
- 🤖 AI Chatbot: Ask questions about revenue, trends, or get tabular outputs
- 🧠 Search-Based QA: Handles fuzzy questions using `qa_pipeline.search()`
- 🎨 Glassmorphism UI: Modern, responsive, animated interface
- 🔁 Category Filtering: Dashboard updates when a category is clicked


🧰 Tech Stack

| Frontend      | Backend       | ML/Forecasting | Visualization | Other           |
|---------------|---------------|----------------|----------------|-----------------|
| React         | FastAPI       | scikit-learn   | Chart.js       | Axios, CSS3     |
| Chart.js      | Uvicorn       | NumPy, Pandas  | Line, Bar, Pie | OpenAI pipeline |

---

📂 Project Structure

InsightPulse-Retail/
├── backend/
│ ├── app.py # FastAPI backend
│ ├── qa_pipeline.py # Semantic search logic
│ └── data/
│ └── retail_sales_dataset.csv
├── frontend/
│ ├── src/
│ │ ├── App.js # Mounts Dashboard
│ │ ├── Dashboard.js # Interactive dashboard
│ │ ├── Chatbot.js # Docked chatbot UI
| | ├── BackgroundParticles.js # Background Particles
│ │ └── app.css # Styling + 3D animations
├── README.md

