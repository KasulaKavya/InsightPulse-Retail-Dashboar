// Dashboard.js - Forecast Click Triggers KPI Update
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

  const fetchAllData = () => {
    axios.get(`http://127.0.0.1:8000/kpis`, {
      params: selectedCategory ? { category: selectedCategory } : {}
    }).then((res) => setKpis(res.data));

    axios.get(`http://127.0.0.1:8000/gender-distribution`, {
      params: selectedCategory ? { category: selectedCategory } : {}
    }).then((res) => setGenderData(res.data));

    axios.get(`http://127.0.0.1:8000/forecast`, {
      params: selectedCategory ? { category: selectedCategory } : {}
    }).then((res) => setForecast(res.data));
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedCategory]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/sales-by-category').then((res) => setCategorySales(res.data));
  }, []);

  const groupedByCategory = {};
  categorySales.forEach(({ "Product Category": category, Year, Month, "Total Amount": amount }) => {
    const key = `${category} (${Year})`;
    if (!groupedByCategory[key]) groupedByCategory[key] = 0;
    groupedByCategory[key] += amount;
  });

  const barData = {
    labels: Object.keys(groupedByCategory),
    datasets: [
      {
        label: 'Sales by Category (Yearly)',
        data: Object.values(groupedByCategory),
        backgroundColor: '#B2A4FF',
        hoverBackgroundColor: '#D1C4FF',
        borderRadius: 6
      }
    ]
  };

  const donutData = {
    labels: Object.keys(genderData),
    datasets: [
      {
        label: 'Gender Split',
        data: Object.values(genderData),
        backgroundColor: ['#B2FFF2', '#FFB6D9'],
        borderColor: '#282c34',
        borderWidth: 2,
        cutout: '70%'
      }
    ]
  };

  const forecastChartData = {
    labels: forecast.map((f) => f.ds),
    datasets: [
      {
        label: '📈 Forecast Revenue',
        data: forecast.map((f) => f.yhat),
        borderColor: '#00FFF7',
        backgroundColor: 'rgba(0, 255, 247, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 2
      },
      {
        label: 'Upper Bound',
        data: forecast.map((f) => f.yhat_upper),
        borderColor: 'rgba(0, 255, 0, 0.6)',
        fill: false,
        borderDash: [5, 5],
        tension: 0.3
      },
      {
        label: 'Lower Bound',
        data: forecast.map((f) => f.yhat_lower),
        borderColor: 'rgba(255, 0, 0, 0.6)',
        fill: false,
        borderDash: [5, 5],
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          color: '#B2FFF2'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#ccc' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#ccc' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    },
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const i = elements[0].index;
        const label = forecast[i]?.category;
        if (label) setSelectedCategory(label);
      }
    }
  };

  return (
    <div className="container">
      <h1 className="dashboard-title center">InsightPulse Retail Dashboard</h1>

      {selectedCategory && (
        <div className="filter-label">
          📦 Filtering by <strong>{selectedCategory}</strong>
        </div>
      )}

      <div className="cards">
        <div className="card-glass">Revenue: ${kpis.revenue ?? 'Loading...'}</div>
        <div className="card-glass">Customers: {kpis.customers ?? 'Loading...'}</div>
        <div className="card-glass">Transactions: {kpis.transactions ?? 'Loading...'}</div>
        <div className="card-glass">Avg Basket: ${kpis.avg_basket ?? 'Loading...'}</div>
      </div>

      <div className="chart-grid chart-2col">
        <div className="chart-box-glass">
          <h2>💼 Sales by Product Category (Year)</h2>
          <div style={{ height: '280px' }}>
            <Bar
              data={barData}
              options={{
                ...chartOptions,
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const label = barData.labels[index];
                    const category = label.split(' (')[0];
                    setSelectedCategory((prev) => (prev === category ? null : category));
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-box-glass" onClick={() => fetchAllData()}>
          <h2>👥 Gender Distribution</h2>
          <div style={{ height: '260px', maxWidth: '280px', margin: '0 auto' }}>
            <Doughnut data={donutData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-box-glass">
          <h2>📈 Monthly Revenue Forecast (2023–2024)</h2>
          <div style={{ height: '280px' }}>
            <Line data={forecastChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}

export default Dashboard;
