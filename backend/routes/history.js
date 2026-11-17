const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const historyController = require('../controllers/historyController');

// Get weather history for a city
router.get('/city/:city', verifyToken, historyController.getWeatherHistory);

// Get weather statistics
router.get('/stats/:city', verifyToken, historyController.getWeatherStats);

// Get search history (recently searched cities)
router.get('/search-history', verifyToken, historyController.getSearchHistory);

module.exports = router;
