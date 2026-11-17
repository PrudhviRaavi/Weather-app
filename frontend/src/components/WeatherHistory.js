import React, { useState, useEffect } from 'react';
import WeatherCharts from './WeatherCharts';
import '../styles/WeatherHistory.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const historyService = {
  getHistory: (city, days = 7) => fetch(`${API_BASE}/history/city/${city}?days=${days}`, {
    credentials: 'include',
  }).then(r => r.json()),
  
  getStats: (city, days = 7) => fetch(`${API_BASE}/history/stats/${city}?days=${days}`, {
    credentials: 'include',
  }).then(r => r.json()),
  
  getSearchHistory: () => fetch(`${API_BASE}/history/search-history`, {
    credentials: 'include',
  }).then(r => r.json())
};

const WeatherHistory = ({ city, tempUnit }) => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(city);
  const [showStats, setShowStats] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    if (selectedCity) {
      loadHistory();
      loadStats();
    }
    loadSearchHistory();
  }, [selectedCity, days]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.getHistory(selectedCity, days);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await historyService.getStats(selectedCity, days);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const data = await historyService.getSearchHistory();
      setSearchHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading search history:', err);
    }
  };

  const convertTemp = (celsius) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="weather-history-container">
      <h2>📊 Weather History & Statistics</h2>

      <div className="history-controls">
        <div className="control-group">
          <label>City:</label>
          <input
            type="text"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            placeholder="Enter city name"
            className="city-input"
          />
        </div>

        <div className="control-group">
          <label>Days:</label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="days-select">
            <option value={1}>Last 1 Day</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>

        <button className="btn-stats" onClick={() => setShowStats(!showStats)}>
          {showStats ? '📈 Hide Stats' : '📈 Show Stats'}
        </button>

        <button className="btn-charts" onClick={() => setShowCharts(!showCharts)}>
          {showCharts ? '📊 Hide Charts' : '📊 Show Charts'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">⟳ Loading...</div>}

      {/* Statistics Section */}
      {showStats && stats && (
        <div className="stats-section">
          <h3>📊 Statistics for {stats.city} (Last {days} days)</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">🌡️ Avg Temperature</span>
              <span className="stat-value">{convertTemp(stats.avgTemp)}°{tempUnit}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">📈 Max Temperature</span>
              <span className="stat-value">{convertTemp(stats.maxTemp)}°{tempUnit}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">📉 Min Temperature</span>
              <span className="stat-value">{convertTemp(stats.minTemp)}°{tempUnit}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">💧 Avg Humidity</span>
              <span className="stat-value">{stats.avgHumidity}%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">💨 Avg Wind</span>
              <span className="stat-value">{stats.avgWindSpeed} m/s</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">🔽 Avg Pressure</span>
              <span className="stat-value">{stats.avgPressure} hPa</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {showCharts && history.length > 0 && (
        <WeatherCharts history={history} />
      )}

      {/* History Timeline */}
      <div className="history-section">
        <h3>📅 Weather History</h3>
        {history.length === 0 ? (
          <p className="no-history">No data available for this period</p>
        ) : (
          <div className="history-list">
            {history.map((record, idx) => (
              <div key={record.id} className="history-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="history-date">
                  {formatDate(record.recordedAt)}
                </div>
                <div className="history-info">
                  <div className="info-row">
                    <span className="info-label">🌡️ Temperature:</span>
                    <span className="info-value">{convertTemp(record.temperature)}°{tempUnit}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">☁️ Condition:</span>
                    <span className="info-value">{record.condition}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">💧 Humidity:</span>
                    <span className="info-value">{record.humidity}%</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">💨 Wind:</span>
                    <span className="info-value">{record.windSpeed} m/s</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">🔽 Pressure:</span>
                    <span className="info-value">{record.pressure} hPa</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="search-history-section">
          <h3>🔍 Recently Searched</h3>
          <div className="search-history-list">
            {searchHistory.map((city, idx) => (
              <button
                key={idx}
                className="search-history-btn"
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherHistory;
