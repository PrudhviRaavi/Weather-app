const axios = require('axios');

const API_KEY = process.env.API_KEY;

exports.getCurrentWeather = async (city) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    console.log(`Fetching real weather data for: ${city}`);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch weather data');
  }
};

exports.getForecast = async (city) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    console.log(`Fetching 5-day forecast for: ${city}`);
    const response = await axios.get(url);
    
    // Format forecast data
    const forecasts = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!forecasts[date]) {
        forecasts[date] = {
          date,
          temp: item.main.temp,
          condition: item.weather[0].main,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          pressure: item.main.pressure,
          icon: item.weather[0].icon,
          probability: item.pop ?? 0
        };

        exports.getRainProbability = async (city) => {
          const forecast = await exports.getForecast(city);
          const probabilities = forecast.forecasts.map((item) => item.probability ?? 0);
          return probabilities.length ? Math.max(...probabilities) * 100 : 0;
        };
      }
    });
    
    return {
      city: response.data.city.name,
      forecasts: Object.values(forecasts).slice(0, 5)
    };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch forecast data');
  }
};

exports.getAirQuality = async (lat, lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    console.log(`Fetching air quality for coordinates: ${lat}, ${lon}`);
    const response = await axios.get(url);
    
    const aqi = response.data.list[0].main.aqi;
    const components = response.data.list[0].components;
    
    // Convert AQI number to level
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Unhealthy', 'Hazardous'];
    
    return {
      aqi: Math.round((aqi / 5) * 100), // Convert to 0-100 scale
      level: aqiLevels[aqi - 1] || 'Unknown',
      pm25: Math.round(components.pm2_5 || 0),
      pm10: Math.round(components.pm10 || 0),
      no2: Math.round(components.no2 || 0),
      so2: Math.round(components.so2 || 0),
      o3: Math.round(components.o3 || 0),
      co: Math.round(components.co || 0)
    };
  } catch (error) {
    console.error('Air Quality API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch air quality data from OpenWeatherMap API');
  }
};

exports.getUVIndex = async (lat, lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    console.log(`Fetching UV index for coordinates: ${lat}, ${lon}`);
    const response = await axios.get(url);
    
    return {
      uvIndex: response.data.value,
      riskLevel: response.data.value <= 2 ? 'Low' : 
                 response.data.value <= 5 ? 'Moderate' :
                 response.data.value <= 7 ? 'High' :
                 response.data.value <= 10 ? 'Very High' : 'Extreme'
    };
  } catch (error) {
    console.error('UV Index API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch UV Index data from OpenWeatherMap API');
  }
};

exports.getWeatherByCoordinates = async (lat, lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch weather data');
  }
};
