import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
import './app.css'; // 

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

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/kpis').then(res => setKpis(res.data));
    axios.get('http://127.0.0.1:8000/sales-by-category').then(res => setCategorySales(res.data));
    axios.get('http://127.0.0.1:8000/gender-distribution').then(res => setGenderData(res.data));
    axios.get('http://127.0.0.1:8000/forecast').then(res => setForecast(res.data));
  }, []);

  const barData = {
    labels: categorySales.map(item => item["Product Category"]),
    datasets: [{
      label: 'Sales by Category',
      data: categorySales.map(item => item["Total Amount"]),
      backgroundColor: 'rgba(75, 192, 192, 0.7)'
    }]
  };

  const pieData = {
    labels: Object.keys(genderData),
    datasets: [{
      label: 'Gender Split',
      data: Object.values(genderData),
      backgroundColor: ['#FF6384', '#36A2EB']
    }]
  };

  const forecastChartData = {
    labels: forecast.map(f => f.ds.slice(0, 10)),
    datasets: [
      {
        label: 'Forecast',
        data: forecast.map(f => f.yhat),
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        fill: false,
        tension: 0.3
      },
      {
        label: 'Lower Bound',
        data: forecast.map(f => f.yhat_lower),
        borderColor: 'gray',
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Upper Bound',
        data: forecast.map(f => f.yhat_upper),
        borderColor: 'gray',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  return (
    <div className="container">
      <h1>📊 InsightPulse Retail Dashboard</h1>

      <div className="cards">
        <div className="card">
          Revenue: ${kpis.revenue !== undefined ? kpis.revenue : 'Loading...'}
        </div>
        <div className="card">
          Customers: {kpis.customers !== undefined ? kpis.customers : 'Loading...'}
        </div>
        <div className="card">
          Transactions: {kpis.transactions !== undefined ? kpis.transactions : 'Loading...'}
        </div>
        <div className="card">
          Avg Basket: ${kpis.avg_basket !== undefined ? kpis.avg_basket : 'Loading...'}
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <h2>💼 Sales by Product Category</h2>
          <div style={{ height: '280px' }}>
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="chart-box">
          <h2>👥 Gender Distribution</h2>
          <div style={{ height: '250px', maxWidth: '260px', margin: '0 auto' }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="chart-box">
          <h2>📈 30-Day Revenue Forecast</h2>
          <div style={{ height: '280px' }}>
            <Line data={forecastChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Chatbot in a full-width box */}
        <div className="chart-box" style={{ gridColumn: "1 / -1" }}>
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
