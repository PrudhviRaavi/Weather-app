const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const { getCurrentWeather } = require('../utils/weatherAPI');

// Record weather data for a city
exports.recordWeather = async (city, userId) => {
  try {
    const weather = await getCurrentWeather(city);
    const historyId = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO weather_history (id, user_id, city, temperature, condition, humidity, wind_speed, pressure, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      historyId,
      userId,
      weather.name,
      weather.main.temp,
      weather.weather[0].main,
      weather.main.humidity,
      weather.wind.speed,
      weather.main.pressure,
      new Date().toISOString()
    );
    
    return {
      id: historyId,
      city: weather.name,
      temperature: weather.main.temp,
      condition: weather.weather[0].main,
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      pressure: weather.main.pressure,
      recordedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error recording weather:', error);
    throw error;
  }
};

// Get weather history for a user and city
exports.getWeatherHistory = (req, res) => {
  try {
    const userId = req.user.id;
    const { city, days = 7 } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter required' });
    }
    
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const stmt = db.prepare(`
      SELECT * FROM weather_history
      WHERE user_id = ? AND city = ? AND recorded_at > ?
      ORDER BY recorded_at DESC
    `);
    
    const history = stmt.all(userId, city, daysAgo);
    
    res.json(history.map(h => ({
      id: h.id,
      city: h.city,
      temperature: h.temperature,
      condition: h.condition,
      humidity: h.humidity,
      windSpeed: h.wind_speed,
      pressure: h.pressure,
      recordedAt: h.recorded_at
    })));
  } catch (error) {
    console.error('Get weather history error:', error);
    res.status(500).json({ error: 'Failed to fetch weather history' });
  }
};

// Get weather statistics for a city
exports.getWeatherStats = (req, res) => {
  try {
    const userId = req.user.id;
    const { city, days = 7 } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter required' });
    }
    
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const stmt = db.prepare(`
      SELECT 
        city,
        COUNT(*) as total_records,
        ROUND(AVG(temperature), 1) as avg_temp,
        MIN(temperature) as min_temp,
        MAX(temperature) as max_temp,
        ROUND(AVG(humidity), 1) as avg_humidity,
        ROUND(AVG(wind_speed), 1) as avg_wind,
        ROUND(AVG(pressure), 1) as avg_pressure
      FROM weather_history
      WHERE user_id = ? AND city = ? AND recorded_at > ?
      GROUP BY city
    `);
    
    const stats = stmt.get(userId, city, daysAgo);
    
    if (!stats) {
      return res.json({
        city,
        message: 'No data available for this period'
      });
    }
    
    res.json({
      city: stats.city,
      totalRecords: stats.total_records,
      avgTemp: stats.avg_temp,
      minTemp: stats.min_temp,
      maxTemp: stats.max_temp,
      avgHumidity: stats.avg_humidity,
      avgWindSpeed: stats.avg_wind,
      avgPressure: stats.avg_pressure
    });
  } catch (error) {
    console.error('Get weather stats error:', error);
    res.status(500).json({ error: 'Failed to fetch weather statistics' });
  }
};

// Search history
exports.getSearchHistory = (req, res) => {
  try {
    const userId = req.user.id;
    
    const stmt = db.prepare(`
      SELECT DISTINCT city FROM weather_history
      WHERE user_id = ?
      ORDER BY recorded_at DESC
      LIMIT 20
    `);
    
    const history = stmt.all(userId);
    res.json(history.map(h => h.city));
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
};

// Clear old weather history (for cleanup)
exports.clearOldHistory = () => {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const stmt = db.prepare('DELETE FROM weather_history WHERE recorded_at < ?');
    const result = stmt.run(ninetyDaysAgo);
    console.log(`Deleted ${result.changes} old weather records`);
  } catch (error) {
    console.error('Error clearing old history:', error);
  }
};
