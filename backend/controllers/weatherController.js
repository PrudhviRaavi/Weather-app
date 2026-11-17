const { getCurrentWeather, getForecast, getWeatherByCoordinates, getAirQuality, getUVIndex } = require('../utils/weatherAPI');

exports.getWeatherByCity = async (req, res) => {
  try {
    const { city } = req.params;
    console.log('Fetching weather for city:', city);
    const weather = await getCurrentWeather(city);
    res.json(weather);
  } catch (error) {
    console.error('Weather error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getForecastByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const forecast = await getForecast(city);
    res.json(forecast);
  } catch (error) {
    console.error('Forecast error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getWeatherByLocation = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const weather = await getWeatherByCoordinates(lat, lon);
    res.json(weather);
  } catch (error) {
    console.error('Location weather error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getAirQualityByCity = async (req, res) => {
  try {
    const { city } = req.params;
    // First get city coordinates
    const weather = await getCurrentWeather(city);
    const aqi = await getAirQuality(weather.coord.lat, weather.coord.lon);
    res.json({ city: weather.name, ...aqi });
  } catch (error) {
    console.error('Air quality error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getUVIndexByCity = async (req, res) => {
  try {
    const { city } = req.params;
    // First get city coordinates
    const weather = await getCurrentWeather(city);
    const uv = await getUVIndex(weather.coord.lat, weather.coord.lon);
    res.json({ city: weather.name, ...uv });
  } catch (error) {
    console.error('UV index error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
