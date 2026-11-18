const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getWeatherByCity, getForecastByCity, getWeatherByLocation, getAirQualityByCity, getUVIndexByCity } = require('../controllers/weatherController');

router.get('/city/:city', verifyToken, getWeatherByCity);
router.get('/forecast/:city', getForecastByCity);
router.get('/location', verifyToken, getWeatherByLocation);
router.get('/aqi/:city', getAirQualityByCity);
router.get('/uv/:city', getUVIndexByCity);

module.exports = router;
