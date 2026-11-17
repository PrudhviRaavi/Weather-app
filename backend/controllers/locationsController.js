const db = require('../database');
const { v4: uuidv4 } = require('uuid');

exports.addLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { city, lat, lon, country, name } = req.body;

    const locationId = uuidv4();
    db.prepare(
      'INSERT INTO locations (id, user_id, city, lat, lon, country, name) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(locationId, userId, city, lat, lon, country, name || city);

    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(locationId);

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const userId = req.userId;

    const locations = db.prepare(
      'SELECT * FROM locations WHERE user_id = ? ORDER BY saved_at DESC'
    ).all(userId);

    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    db.prepare(
      'DELETE FROM locations WHERE id = ? AND user_id = ?'
    ).run(id, userId);

    res.json({ message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
