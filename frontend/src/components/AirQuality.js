import React, { useState, useEffect } from 'react';
import '../styles/AirQuality.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const aqiService = {
  getAirQuality: (city) => fetch(`${API_BASE}/weather/aqi/${city}`, {
    credentials: 'include',
  }).then(r => r.json()),
  
  getUVIndex: (city) => fetch(`${API_BASE}/weather/uv/${city}`, {
    credentials: 'include',
  }).then(r => r.json())
};

const AirQuality = ({ city = 'London' }) => {
  const [aqi, setAqi] = useState(null);
  const [uv, setUV] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(city);

  useEffect(() => {
    loadAirQuality();
    loadUVIndex();
  }, [selectedCity]);

  const loadAirQuality = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aqiService.getAirQuality(selectedCity);
      if (data && data.error) {
        setError(data.error);
        setAqi(null);
      } else {
        setAqi(data);
      }
    } catch (error) {
      console.error('Error loading air quality:', error);
      setError('Failed to load air quality data');
      setAqi(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUVIndex = async () => {
    try {
      const data = await aqiService.getUVIndex(selectedCity);
      if (data && data.error) {
        console.error('UV Index error:', data.error);
        setUV(null);
      } else if (data && data.uvIndex !== undefined) {
        setUV(data);
      }
    } catch (error) {
      console.error('Error loading UV index:', error);
      setUV(null);
    }
  };

  const getAQIColor = (level) => {
    const colors = {
      'Good': '#27ae60',
      'Fair': '#f0ad4e',
      'Moderate': '#f5a623',
      'Poor': '#e74c3c',
      'Unhealthy for Sensitive Groups': '#e67e22',
      'Unhealthy': '#c0392b',
      'Hazardous': '#34495e'
    };
    return colors[level] || '#95a5a6';
  };

  const getAQIDescription = (level) => {
    const descriptions = {
      'Good': 'Air quality is satisfactory',
      'Fair': 'Air quality is acceptable',
      'Moderate': 'Members of sensitive groups may experience health issues',
      'Poor': 'Everyone may start to experience health issues',
      'Unhealthy for Sensitive Groups': 'Sensitive groups should consider limiting outdoor activities',
      'Unhealthy': 'Everyone may experience serious health issues',
      'Hazardous': 'Everyone should avoid outdoor activities'
    };
    return descriptions[level] || 'Unable to determine air quality';
  };

  return (
    <div className="air-quality-container">
      <h2>🌫️ Air Quality Index (AQI)</h2>

      <div className="aqi-search">
        <input
          type="text"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          placeholder="Enter city name"
          className="aqi-input"
        />
      </div>

      {loading && <div className="loading">⟳ Loading air quality data...</div>}
      {error && <div className="error">❌ {error}</div>}

      {aqi && (
        <>
          {/* Main AQI Display */}
          <div className="aqi-main" style={{ borderColor: getAQIColor(aqi.level) }}>
            <div className="aqi-circle" style={{ backgroundColor: getAQIColor(aqi.level) }}>
              <span className="aqi-value">{aqi.aqi}</span>
            </div>
            <div className="aqi-info">
              <h3>{selectedCity}</h3>
              <p className="aqi-level" style={{ color: getAQIColor(aqi.level) }}>
                {aqi.level}
              </p>
              <p className="aqi-description">{getAQIDescription(aqi.level)}</p>
            </div>
          </div>

          {/* Pollutants Details */}
          <div className="pollutants-section">
            <h3>📊 Pollutant Levels</h3>
            <div className="pollutants-grid">
              <div className="pollutant-card">
                <div className="pollutant-name">PM2.5</div>
                <div className="pollutant-value">{aqi.pm25} µg/m³</div>
                <div className="pollutant-description">Fine Particulate Matter</div>
                <div className="pollutant-bar">
                  <div 
                    className="pollutant-bar-fill" 
                    style={{ width: `${Math.min((aqi.pm25 / 100) * 100, 100)}%`, backgroundColor: getAQIColor(aqi.level) }}
                  />
                </div>
              </div>

              <div className="pollutant-card">
                <div className="pollutant-name">PM10</div>
                <div className="pollutant-value">{aqi.pm10} µg/m³</div>
                <div className="pollutant-description">Coarse Particulate Matter</div>
                <div className="pollutant-bar">
                  <div 
                    className="pollutant-bar-fill" 
                    style={{ width: `${Math.min((aqi.pm10 / 180) * 100, 100)}%`, backgroundColor: getAQIColor(aqi.level) }}
                  />
                </div>
              </div>

              <div className="pollutant-card">
                <div className="pollutant-name">NO₂</div>
                <div className="pollutant-value">{aqi.no2} ppb</div>
                <div className="pollutant-description">Nitrogen Dioxide</div>
                <div className="pollutant-bar">
                  <div 
                    className="pollutant-bar-fill" 
                    style={{ width: `${Math.min((aqi.no2 / 100) * 100, 100)}%`, backgroundColor: getAQIColor(aqi.level) }}
                  />
                </div>
              </div>

              <div className="pollutant-card">
                <div className="pollutant-name">O₃</div>
                <div className="pollutant-value">{aqi.o3} ppb</div>
                <div className="pollutant-description">Ozone</div>
                <div className="pollutant-bar">
                  <div 
                    className="pollutant-bar-fill" 
                    style={{ width: `${Math.min((aqi.o3 / 100) * 100, 100)}%`, backgroundColor: getAQIColor(aqi.level) }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Health Recommendations */}
          <div className="health-recommendations">
            <h3>💚 Recommendations</h3>
            <div className="recommendations-list">
              {aqi.level === 'Good' && (
                <>
                  <div className="recommendation-item">✓ Air quality is satisfactory</div>
                  <div className="recommendation-item">✓ Enjoy outdoor activities safely</div>
                </>
              )}
              {aqi.level === 'Fair' && (
                <>
                  <div className="recommendation-item">⚠️ Air quality is acceptable for most</div>
                  <div className="recommendation-item">⚠️ Sensitive individuals may want to limit prolonged outdoor exertion</div>
                </>
              )}
              {aqi.level === 'Moderate' && (
                <>
                  <div className="recommendation-item">⚠️ Members of sensitive groups should limit outdoor exertion</div>
                  <div className="recommendation-item">⚠️ Consider wearing an N95 mask if staying outdoors</div>
                </>
              )}
              {(aqi.level === 'Poor' || aqi.level === 'Unhealthy for Sensitive Groups') && (
                <>
                  <div className="recommendation-item">❌ Sensitive groups should avoid outdoor activities</div>
                  <div className="recommendation-item">❌ Everyone should limit prolonged outdoor exertion</div>
                  <div className="recommendation-item">❌ Wear N95 masks if exposure is unavoidable</div>
                  <div className="recommendation-item">❌ Use air purifiers indoors</div>
                </>
              )}
              {aqi.level === 'Unhealthy' && (
                <>
                  <div className="recommendation-item">❌ Everyone should limit outdoor activities</div>
                  <div className="recommendation-item">❌ Wear N95 masks when outdoors</div>
                  <div className="recommendation-item">❌ Keep windows and doors closed</div>
                  <div className="recommendation-item">❌ Use HEPA air purifiers</div>
                </>
              )}
              {aqi.level === 'Hazardous' && (
                <>
                  <div className="recommendation-item">🚨 AVOID ALL OUTDOOR ACTIVITIES</div>
                  <div className="recommendation-item">🚨 Stay indoors with air filtration running</div>
                  <div className="recommendation-item">🚨 Seek medical care if experiencing symptoms</div>
                </>
              )}
            </div>
          </div>

          {/* AQI Scale */}
          <div className="aqi-scale">
            <h3>📈 AQI Scale</h3>
            <div className="scale-items">
              <div className="scale-item" style={{ borderLeft: `4px solid #27ae60` }}>
                <span className="scale-range">0-50</span>
                <span className="scale-label">Good</span>
              </div>
              <div className="scale-item" style={{ borderLeft: `4px solid #f0ad4e` }}>
                <span className="scale-range">51-100</span>
                <span className="scale-label">Fair</span>
              </div>
              <div className="scale-item" style={{ borderLeft: `4px solid #f5a623` }}>
                <span className="scale-range">101-150</span>
                <span className="scale-label">Moderate</span>
              </div>
              <div className="scale-item" style={{ borderLeft: `4px solid #e74c3c` }}>
                <span className="scale-range">151-200</span>
                <span className="scale-label">Poor</span>
              </div>
              <div className="scale-item" style={{ borderLeft: `4px solid #c0392b` }}>
                <span className="scale-range">201-300</span>
                <span className="scale-label">Unhealthy</span>
              </div>
              <div className="scale-item" style={{ borderLeft: `4px solid #34495e` }}>
                <span className="scale-range">300+</span>
                <span className="scale-label">Hazardous</span>
              </div>
            </div>
          </div>

          {/* UV Index Section */}
          {uv && uv.uvIndex !== undefined && (
            <div className="uv-section">
              <h3>☀️ UV Index</h3>
              <div className="uv-card">
                <div className="uv-value" style={{ color: getUVRiskColor(uv.riskLevel) }}>
                  {typeof uv.uvIndex === 'number' ? uv.uvIndex.toFixed(1) : uv.uvIndex}
                </div>
                <div className="uv-risk" style={{ color: getUVRiskColor(uv.riskLevel) }}>
                  {uv.riskLevel} Risk
                </div>
                <div className="uv-info">
                  {uv.riskLevel === 'Low' && '✓ Safe sun exposure'}
                  {uv.riskLevel === 'Moderate' && '⚠️ Use SPF 30+ sunscreen'}
                  {uv.riskLevel === 'High' && '⚠️ Limit sun exposure, use SPF 50+'}
                  {uv.riskLevel === 'Very High' && '❌ Avoid sun exposure, use SPF 50+'}
                  {uv.riskLevel === 'Extreme' && '🚨 Stay indoors'}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const getUVRiskColor = (risk) => {
  const colors = {
    'Low': '#27ae60',
    'Moderate': '#f0ad4e',
    'High': '#f5a623',
    'Very High': '#e74c3c',
    'Extreme': '#c0392b'
  };
  return colors[risk] || '#95a5a6';
};

export default AirQuality;
