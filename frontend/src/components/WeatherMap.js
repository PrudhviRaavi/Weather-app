import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/WeatherMap.css';

const WeatherMap = ({ city = 'London' }) => {
  const mapRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(city);

  // Initialize map only once when component mounts
  useEffect(() => {
    const mapContainer = document.getElementById('weather-map');
    
    // Prevent double initialization in React strict mode
    if (!mapContainer || mapRef.current) return;

    try {
      // Check if Leaflet already initialized this container
      if (mapContainer._leaflet_id) {
        mapRef.current = L.map('weather-map');
      } else {
        const leafletMap = L.map('weather-map').setView([51.5074, -0.1278], 10);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(leafletMap);

        mapRef.current = leafletMap;
      }

      // Load initial city
      fetchWeatherAndUpdateMap();
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Update map when selected city changes
    if (mapRef.current) {
      fetchWeatherAndUpdateMap();
    }
  }, [selectedCity]);

  const fetchWeatherAndUpdateMap = async () => {
    if (!mapRef.current) return;
    
    setLoading(true);
    try {
      // Get coordinates for the city
      const response = await fetch(`http://localhost:5000/api/weather/city/${selectedCity}`);
      const data = await response.json();
      
      if (data && data.coord) {
        setWeather(data);
        const { lat, lon } = data.coord;
        
        // Update map center
        mapRef.current.setView([lat, lon], 10);
        
        // Clear existing markers
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapRef.current.removeLayer(layer);
          }
        });

        // Add city marker with popup
        const marker = L.marker([lat, lon])
          .addTo(mapRef.current)
          .bindPopup(`
            <div class="map-popup">
              <h4>${data.name}, ${data.sys?.country}</h4>
              <p><strong>🌡️ Temp:</strong> ${Math.round(data.main.temp)}°C</p>
              <p><strong>😊 Condition:</strong> ${data.weather[0].main}</p>
              <p><strong>💧 Humidity:</strong> ${data.main.humidity}%</p>
              <p><strong>💨 Wind:</strong> ${data.wind.speed} m/s</p>
              <p><strong>🔽 Pressure:</strong> ${data.main.pressure} hPa</p>
            </div>
          `)
          .openPopup();
      }
    } catch (error) {
      console.error('Error fetching weather for map:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSelectedCity(e.target.value);
    }
  };

  return (
    <div className="weather-map-container">
      <h2>🗺️ Weather Map</h2>
      
      <div className="map-search">
        <input
          type="text"
          defaultValue={selectedCity}
          onKeyPress={handleSearch}
          placeholder="Enter city name and press Enter"
          className="map-input"
        />
        <div className="map-info">
          {loading && <span>⟳ Loading...</span>}
          {weather && (
            <span>
              {weather.name}: {Math.round(weather.main.temp)}°C, {weather.weather[0].main}
            </span>
          )}
        </div>
      </div>

      <div id="weather-map" className="map-canvas"></div>

      <div className="map-legend">
        <h4>🎨 Layers:</h4>
        <ul>
          <li>🟫 Background: OpenStreetMap</li>
          <li>🌧️ Overlay: Precipitation (1 hour)</li>
          <li>📍 Marker: Current city location</li>
        </ul>
      </div>
    </div>
  );
};

export default WeatherMap;
