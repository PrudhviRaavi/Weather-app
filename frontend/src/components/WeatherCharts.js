import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import '../styles/WeatherCharts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeatherCharts = ({ history }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  useEffect(() => {
    if (history && history.length > 0) {
      prepareChartData();
    }
  }, [history]);

  const prepareChartData = () => {
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)
    );

    const labels = sortedHistory.map((item) => {
      const date = new Date(item.recorded_at);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    });

    setChartData({
      labels,
      temperature: sortedHistory.map((item) => item.temperature),
      humidity: sortedHistory.map((item) => item.humidity),
      windSpeed: sortedHistory.map((item) => item.wind_speed),
      pressure: sortedHistory.map((item) => item.pressure),
      feelLike: sortedHistory.map((item) => item.feels_like),
    });
  };

  if (!chartData) {
    return <div className="charts-container">📊 Loading chart data...</div>;
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: '600' },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 },
        padding: 10,
        borderRadius: 6,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  const getTemperatureChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: chartData.temperature,
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#FF6B6B',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
      {
        label: 'Feels Like (°C)',
        data: chartData.feelLike,
        borderColor: '#FFB84D',
        backgroundColor: 'rgba(255, 184, 77, 0.05)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#FFB84D',
        borderDash: [5, 5],
      },
    ],
  };

  const getHumidityChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Humidity (%)',
        data: chartData.humidity,
        borderColor: '#4ECDC1',
        backgroundColor: 'rgba(78, 205, 193, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#4ECDC1',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
    ],
  };

  const getWindSpeedChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Wind Speed (m/s)',
        data: chartData.windSpeed,
        backgroundColor: '#667eea',
        borderColor: '#667eea',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const getPressureChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Pressure (mb)',
        data: chartData.pressure,
        borderColor: '#A78BFA',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#A78BFA',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <div className="charts-container">
      <div className="charts-header">
        <h2>📊 Weather Trends Analysis</h2>
        <div className="metric-selector">
          <button
            className={`metric-btn ${selectedMetric === 'temperature' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('temperature')}
          >
            🌡️ Temperature
          </button>
          <button
            className={`metric-btn ${selectedMetric === 'humidity' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('humidity')}
          >
            💧 Humidity
          </button>
          <button
            className={`metric-btn ${selectedMetric === 'windSpeed' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('windSpeed')}
          >
            💨 Wind Speed
          </button>
          <button
            className={`metric-btn ${selectedMetric === 'pressure' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('pressure')}
          >
            🔬 Pressure
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {selectedMetric === 'temperature' && (
          <div className="chart-card">
            <h3>Temperature Trends</h3>
            <Line data={getTemperatureChartData} options={commonOptions} />
          </div>
        )}

        {selectedMetric === 'humidity' && (
          <div className="chart-card">
            <h3>Humidity Trends</h3>
            <Line data={getHumidityChartData} options={commonOptions} />
          </div>
        )}

        {selectedMetric === 'windSpeed' && (
          <div className="chart-card">
            <h3>Wind Speed Analysis</h3>
            <Bar data={getWindSpeedChartData} options={commonOptions} />
          </div>
        )}

        {selectedMetric === 'pressure' && (
          <div className="chart-card">
            <h3>Pressure Trends</h3>
            <Line data={getPressureChartData} options={commonOptions} />
          </div>
        )}

        {/* Summary Stats */}
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-label">Avg Temp</div>
            <div className="stat-value">
              {(
                chartData.temperature.reduce((a, b) => a + b, 0) /
                chartData.temperature.length
              ).toFixed(1)}
              °C
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Max Temp</div>
            <div className="stat-value">{Math.max(...chartData.temperature).toFixed(1)}°C</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Min Temp</div>
            <div className="stat-value">{Math.min(...chartData.temperature).toFixed(1)}°C</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Humidity</div>
            <div className="stat-value">
              {Math.round(
                chartData.humidity.reduce((a, b) => a + b, 0) / chartData.humidity.length
              )}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCharts;
