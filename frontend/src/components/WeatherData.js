import React, { useState, useEffect } from 'react';
import { weatherService } from '../services/api';
import '../styles/WeatherData.css';

const WeatherData = ({ city }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [sunData, setSunData] = useState(null);
  const [moonPhase, setMoonPhase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (city) {
      loadWeatherData();
    }
  }, [city]);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherService.getWeatherByCity(city);
      setWeatherData(data.data);

      // Calculate sunrise/sunset times
      const sunrise = new Date(data.data.sys.sunrise * 1000);
      const sunset = new Date(data.data.sys.sunset * 1000);
      setSunData({
        sunrise: sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Calculate moon phase
      calculateMoonPhase(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMoonPhase = (date) => {
    // Calculate moon phase using astronomical algorithm
    const knownNewMoon = new Date('2000-01-06'); // Known new moon date
    const lunarCycle = 29.53058867; // Days in lunar cycle
    const daysSinceNewMoon = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
    const moonAge = daysSinceNewMoon % lunarCycle;
    const phasePercentage = (moonAge / lunarCycle) * 100;

    let phase = '';
    let emoji = '';

    if (phasePercentage < 6.38) {
      phase = 'New Moon';
      emoji = '🌑';
    } else if (phasePercentage < 25) {
      phase = 'Waxing Crescent';
      emoji = '🌒';
    } else if (phasePercentage < 31.13) {
      phase = 'First Quarter';
      emoji = '🌓';
    } else if (phasePercentage < 50) {
      phase = 'Waxing Gibbous';
      emoji = '🌔';
    } else if (phasePercentage < 56.25) {
      phase = 'Full Moon';
      emoji = '🌕';
    } else if (phasePercentage < 75) {
      phase = 'Waning Gibbous';
      emoji = '🌖';
    } else if (phasePercentage < 81.13) {
      phase = 'Last Quarter';
      emoji = '🌗';
    } else {
      phase = 'Waning Crescent';
      emoji = '🌘';
    }

    setMoonPhase({
      phase,
      emoji,
      percentage: phasePercentage.toFixed(1),
    });
  };

  if (loading) {
    return <div className="weather-data-container">⟳ Loading weather data...</div>;
  }

  if (error) {
    return <div className="weather-data-container error">❌ {error}</div>;
  }

  if (!weatherData) {
    return <div className="weather-data-container">📍 Select a city to view weather data</div>;
  }

  return (
    <div className="weather-data-container">
      <div className="weather-data-grid">
        {/* Sunrise/Sunset */}
        <div className="weather-data-card">
          <h3>🌅 Sun Times</h3>
          <div className="sun-times">
            <div className="time-item">
              <span className="time-label">Sunrise</span>
              <span className="time-value">{sunData?.sunrise}</span>
            </div>
            <div className="time-item">
              <span className="time-label">Sunset</span>
              <span className="time-value">{sunData?.sunset}</span>
            </div>
          </div>
        </div>

        {/* Moon Phase */}
        {moonPhase && (
          <div className="weather-data-card">
            <h3>🌙 Moon Phase</h3>
            <div className="moon-phase">
              <div className="moon-emoji">{moonPhase.emoji}</div>
              <div className="moon-info">
                <div className="moon-name">{moonPhase.phase}</div>
                <div className="moon-percentage">{moonPhase.percentage}% Illuminated</div>
              </div>
            </div>
          </div>
        )}

        {/* Pressure & Visibility */}
        <div className="weather-data-card">
          <h3>🔬 Atmospheric Data</h3>
          <div className="atmospheric">
            <div className="atmo-item">
              <span className="atmo-label">Pressure</span>
              <span className="atmo-value">{weatherData.main.pressure} mb</span>
            </div>
            <div className="atmo-item">
              <span className="atmo-label">Visibility</span>
              <span className="atmo-value">{(weatherData.visibility / 1000).toFixed(1)} km</span>
            </div>
            <div className="atmo-item">
              <span className="atmo-label">Feel Like</span>
              <span className="atmo-value">{weatherData.main.feels_like.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        {/* Wind Details */}
        <div className="weather-data-card">
          <h3>💨 Wind Information</h3>
          <div className="wind-info">
            <div className="wind-item">
              <span className="wind-label">Speed</span>
              <span className="wind-value">{(weatherData.wind.speed * 3.6).toFixed(1)} km/h</span>
            </div>
            <div className="wind-item">
              <span className="wind-label">Gust</span>
              <span className="wind-value">{weatherData.wind.gust ? (weatherData.wind.gust * 3.6).toFixed(1) : 'N/A'} km/h</span>
            </div>
            <div className="wind-item">
              <span className="wind-label">Direction</span>
              <span className="wind-value">{getWindDirection(weatherData.wind.deg)}°</span>
            </div>
          </div>
        </div>

        {/* Humidity & Clouds */}
        <div className="weather-data-card">
          <h3>💧 Moisture & Coverage</h3>
          <div className="moisture">
            <div className="moisture-bar">
              <label>Humidity</label>
              <div className="bar">
                <div className="fill" style={{ width: `${weatherData.main.humidity}%` }}></div>
              </div>
              <span>{weatherData.main.humidity}%</span>
            </div>
            <div className="moisture-bar">
              <label>Cloud Cover</label>
              <div className="bar">
                <div className="fill" style={{ width: `${weatherData.clouds.all}%` }}></div>
              </div>
              <span>{weatherData.clouds.all}%</span>
            </div>
          </div>
        </div>

        {/* UV & Air Quality Note */}
        <div className="weather-data-card">
          <h3>☀️ Additional Info</h3>
          <div className="additional-info">
            <p>💡 For UV Index and Air Quality data, visit the Air Quality tab</p>
            <p>📊 View historical trends in the History tab</p>
            <p>🚨 Set up alerts to stay informed about weather changes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getWindDirection = (degrees) => {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return dirs[index];
};

export default WeatherData;
