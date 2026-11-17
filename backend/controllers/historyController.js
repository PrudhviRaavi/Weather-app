const db = require('../database');
const { getCurrentWeather } = require('../utils/weatherAPI');

// Record weather data for a city
exports.recordWeather = async (city, userId) => {
  try {
    const weather = await getCurrentWeather(city);
    const history = await db.weatherHistory.create({
      data: {
        userId,
        city: weather.name,
        temperature: weather.main.temp,
        condition: weather.weather[0].main,
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed,
        pressure: weather.main.pressure
      }
    });
    
    return {
      id: history.id,
      city: weather.name,
      temperature: weather.main.temp,
      condition: weather.weather[0].main,
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      pressure: weather.main.pressure,
      recordedAt: history.recordedAt
    };
  } catch (error) {
    console.error('Error recording weather:', error);
    throw error;
  }
};

// Get weather history for a user and city
exports.getWeatherHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;
    const city = req.params.city || req.query.city;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter required' });
    }
    
    const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    const history = await db.weatherHistory.findMany({
      where: { userId, city, recordedAt: { gt: daysAgo } },
      orderBy: { recordedAt: 'desc' }
    });
    
    res.json(history.map(h => ({
      id: h.id,
      city: h.city,
      temperature: h.temperature,
      condition: h.condition,
      humidity: h.humidity,
      windSpeed: h.windSpeed,
      pressure: h.pressure,
      recordedAt: h.recordedAt
    })));
  } catch (error) {
    console.error('Get weather history error:', error);
    res.status(500).json({ error: 'Failed to fetch weather history' });
  }
};

// Get weather statistics for a city
exports.getWeatherStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;
    const city = req.params.city || req.query.city;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter required' });
    }
    
    const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    const records = await db.weatherHistory.findMany({
      where: { userId, city, recordedAt: { gt: daysAgo } }
    });
    
    if (records.length === 0) {
      return res.json({
        city,
        message: 'No data available for this period'
      });
    }
    
    const average = (field) => {
      const values = records.map((record) => record[field]).filter((value) => value !== null);
      return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null;
    };
    const values = (field) => records.map((record) => record[field]).filter((value) => value !== null);
    const temperatures = values('temperature');
    res.json({
      city,
      totalRecords: records.length,
      avgTemp: average('temperature'),
      minTemp: temperatures.length ? Math.min(...temperatures) : null,
      maxTemp: temperatures.length ? Math.max(...temperatures) : null,
      avgHumidity: average('humidity'),
      avgWindSpeed: average('windSpeed'),
      avgPressure: average('pressure')
    });
  } catch (error) {
    console.error('Get weather stats error:', error);
    res.status(500).json({ error: 'Failed to fetch weather statistics' });
  }
};

// Search history
exports.getSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const history = await db.weatherHistory.findMany({
      where: { userId },
      distinct: ['city'],
      orderBy: { recordedAt: 'desc' },
      take: 20,
      select: { city: true }
    });
    res.json(history.map((record) => record.city));
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
};

// Clear old weather history (for cleanup)
exports.clearOldHistory = async () => {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = await db.weatherHistory.deleteMany({ where: { recordedAt: { lt: ninetyDaysAgo } } });
    console.log(`Deleted ${result.count} old weather records`);
  } catch (error) {
    console.error('Error clearing old history:', error);
  }
};
