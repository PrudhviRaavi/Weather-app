const express = require('express');
const router = express.Router();
const { getWeatherByCity, getForecastByCity, getWeatherByLocation, getAirQualityByCity, getUVIndexByCity } = require('../controllers/weatherController');

router.get('/city/:city', getWeatherByCity);
router.get('/forecast/:city', getForecastByCity);
router.get('/location', getWeatherByLocation);
router.get('/aqi/:city', getAirQualityByCity);
router.get('/uv/:city', getUVIndexByCity);

module.exports = router;
