// ✅ Dashboard.js - Glassmorphic Dark Theme with Donut Chart
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';

import Chatbot from './chatbot';
import './app.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

function Dashboard() {
  const [kpis, setKpis] = useState({});
  const [categorySales, setCategorySales] = useState([]);
  const [genderData, setGenderData] = useState({});
  const [forecast, setForecast] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/kpis`, {
        params: selectedCategory ? { category: selectedCategory } : {}
      })
      .then((res) => setKpis(res.data));

    axios
      .get(`http://127.0.0.1:8000/gender-distribution`, {
        params: selectedCategory ? { category: selectedCategory } : {}
      })
      .then((res) => setGenderData(res.data));

    axios
      .get(`http://127.0.0.1:8000/forecast`, {
        params: selectedCategory ? { category: selectedCategory } : {}
      })
      .then((res) => setForecast(res.data));
  }, [selectedCategory]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/sales-by-category').then((res) => setCategorySales(res.data));
  }, []);

  const barData = {
    labels: categorySales.map((item) => item['Product Category']),
    datasets: [
      {
        label: 'Sales by Category',
        data: categorySales.map((item) => item['Total Amount']),
        backgroundColor: 'rgba(0, 255, 255, 0.6)'
      }
    ]
  };

  const donutData = {
    labels: Object.keys(genderData),
    datasets: [
      {
        label: 'Gender Split',
        data: Object.values(genderData),
        backgroundColor: ['#ff6384', '#36a2eb'],
        borderWidth: 2,
        cutout: '70%'
      }
    ]
  };

  const forecastChartData = {
    labels: forecast.map((f) => f.ds.slice(0, 10)),
    datasets: [
      {
        label: 'Forecast',
        data: forecast.map((f) => f.yhat),
        borderColor: '#00e5ff',
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        fill: false,
        tension: 0.3
      },
      {
        label: 'Lower Bound',
        data: forecast.map((f) => f.yhat_lower),
        borderColor: '#888',
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Upper Bound',
        data: forecast.map((f) => f.yhat_upper),
        borderColor: '#888',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  return (
    <div className="container">
      <h1 className="dashboard-title center ">InsightPulse Retail Dashboard</h1>

      {selectedCategory && (
        <div className="filter-label">
          📦 Filtering by <strong>{selectedCategory}</strong>
        </div>
      )}

      <div className="cards">
        <div className="card-glass">Revenue: ${kpis.revenue !== undefined ? kpis.revenue : 'Loading...'}</div>
        <div className="card-glass">Customers: {kpis.customers !== undefined ? kpis.customers : 'Loading...'}</div>
        <div className="card-glass">Transactions: {kpis.transactions !== undefined ? kpis.transactions : 'Loading...'}</div>
        <div className="card-glass">Avg Basket: ${kpis.avg_basket !== undefined ? kpis.avg_basket : 'Loading...'}</div>
      </div>

      <div className="chart-grid">
        <div className="chart-box-glass">
          <h2>💼 {selectedCategory ? `${selectedCategory} Sales Overview` : 'Sales by Product Category'}</h2>
          <div style={{ height: '280px' }}>
            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const category = barData.labels[index];
                    setSelectedCategory(prev => prev === category ? null : category);
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-box-glass">
          <h2>👥 {selectedCategory ? `Gender Distribution in ${selectedCategory}` : 'Gender Distribution'}</h2>
          <div style={{ height: '260px', maxWidth: '280px', margin: '0 auto' }}>
            <Doughnut data={donutData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="chart-box-glass">
          <h2>📈 {selectedCategory ? `${selectedCategory} Revenue Forecast (30 Days)` : '30-Day Revenue Forecast'}</h2>
          <div style={{ height: '280px' }}>
            <Line data={forecastChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}

export default Dashboard;
