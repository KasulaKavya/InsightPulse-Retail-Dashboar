import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ForecastChart = () => {
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/forecast')
      .then(res => res.json())
      .then(data => setForecastData(data));
  }, []);

  const labels = forecastData.map(item => item.ds.slice(0, 10));
  const yhat = forecastData.map(item => item.yhat);
  const lower = forecastData.map(item => item.yhat_lower);
  const upper = forecastData.map(item => item.yhat_upper);

  const data = {
    labels,
    datasets: [
      {
        label: 'Forecast (yhat)',
        data: yhat,
        borderColor: 'blue',
        fill: false,
        tension: 0.3
      },
      {
        label: 'Lower Bound',
        data: lower,
        borderColor: 'rgba(0,0,0,0.2)',
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Upper Bound',
        data: upper,
        borderColor: 'rgba(0,0,0,0.2)',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h3>📈 30-Day Revenue Forecast</h3>
      <Line data={data} />
    </div>
  );
};

export default ForecastChart;
