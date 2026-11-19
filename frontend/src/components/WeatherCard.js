import React, { useState, useEffect } from 'react';
import { weatherService, locationService } from '../services/api';
import '../styles/WeatherCard.css';

const WeatherCard = ({ tempUnit, onCitySelect }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('London');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const convertTemp = (celsius) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const fetchWeather = async (searchCity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await weatherService.getWeatherByCity(searchCity);
      setWeather(response.data);
      
      // Fetch real forecast
      const forecastResponse = await weatherService.getForecast(searchCity);
      const forecastData = forecastResponse.data.forecasts || [];
      setForecast(forecastData.slice(0, 5)); // Get first 5 days
      
      checkIfFavorite(searchCity);
      if (onCitySelect) {
        onCitySelect(searchCity);
      }
      window.dispatchEvent(new CustomEvent('weather-observation-saved', {
        detail: { city: response.data.name || searchCity }
      }));
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };



  const checkIfFavorite = (cityName) => {
    const fav = favorites.find(f => f.city.toLowerCase() === cityName.toLowerCase());
    setIsFavorite(!!fav);
  };

  const loadFavorites = async () => {
    try {
      const response = await locationService.getLocations();
      setFavorites(response.data || []);
    } catch (err) {
      setFavorites([]);
    }
  };

  const toggleFavorite = async () => {
    if (!weather) return;

    if (isFavorite) {
      const fav = favorites.find(f => f.city.toLowerCase() === city.toLowerCase());
      if (fav) {
        try {
          await locationService.deleteLocation(fav.id);
          setFavorites(favorites.filter(f => f.id !== fav.id));
          setIsFavorite(false);
        } catch (err) {
          setError('Failed to remove favorite');
        }
      }
    } else {
      try {
        const newFav = await locationService.addLocation({
          city: weather.name,
          lat: weather.coord?.lat,
          lon: weather.coord?.lon,
          country: weather.sys?.country || 'Unknown',
          name: weather.name
        });
        setFavorites([...favorites, newFav.data]);
        setIsFavorite(true);
      } catch (err) {
        setError('Failed to add favorite');
      }
    }
  };

  useEffect(() => {
    fetchWeather(city);
    loadFavorites();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  const loadFavoriteCity = (favCity) => {
    setCity(favCity);
    fetchWeather(favCity);
  };

  return (
    <div className="weather-container">
      {/* Sidebar - Favorites */}
      <aside className="favorites-sidebar">
        <h3>🌟 Favorites</h3>
        <div className="favorites-list">
          {favorites.length === 0 ? (
            <p className="no-favorites">No favorites yet. Save a city!</p>
          ) : (
            favorites.map((fav) => (
              <button
                key={fav.id}
                className={`favorite-item ${fav.city === weather?.name ? 'active' : ''}`}
                onClick={() => loadFavoriteCity(fav.city)}
              >
                📍 {fav.city}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="weather-main">
        <div className="weather-card">
          <h2>Current Weather</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name (London, Mumbai, Paris...)"
              className="search-input"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>

          {loading && <div className="loading">⟳ Loading...</div>}
          {error && <p className="error">❌ {error}</p>}

          {weather && (
            <div className="weather-content">
              <div className="current-weather">
                <div className="weather-header">
                  <div>
                    <h3>{weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ''}</h3>
                    <p className="condition">{weather.weather[0].main}</p>
                  </div>
                  <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={toggleFavorite}
                    title={isFavorite ? 'Remove favorite' : 'Add favorite'}
                  >
                    {isFavorite ? '★' : '☆'}
                  </button>
                </div>

                <div className="weather-grid">
                  <div className="weather-main-info">
                    <div className="temperature">
                      {convertTemp(weather.main.temp)}°{tempUnit}
                    </div>
                    <div className="weather-description">
                      {weather.weather[0].description}
                    </div>
                  </div>

                  <div className="weather-details">
                    <div className="detail-item">
                      <span className="detail-label">💧 Humidity</span>
                      <span className="detail-value">{weather.main.humidity}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">💨 Wind</span>
                      <span className="detail-value">{weather.wind.speed} m/s</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">🔽 Pressure</span>
                      <span className="detail-value">{weather.main.pressure} hPa</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">👁️ Visibility</span>
                      <span className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forecast Toggle */}
              <button
                className="forecast-toggle"
                onClick={() => setShowForecast(!showForecast)}
              >
                {showForecast ? '📋 Hide 5-Day Forecast' : '📋 Show 5-Day Forecast'}
              </button>

              {/* Forecast Section */}
              {showForecast && (
                <div className="forecast-section">
                  <h3>5-Day Forecast</h3>
                  <div className="forecast-grid">
                    {forecast.length > 0 ? forecast.map((day, idx) => (
                      <div key={idx} className="forecast-item">
                        <p className="forecast-day">{day.date || day.day || 'Today'}</p>
                        <p className="forecast-condition">{day.condition || '⛅'}</p>
                        <p className="forecast-temp">{convertTemp(day.temp)}°</p>
                        <p className="forecast-humidity">💧 {day.humidity}%</p>
                      </div>
                    )) : (
                      <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-light)' }}>
                        No forecast data available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
