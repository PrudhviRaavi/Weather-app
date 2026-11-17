const db = require('../database');

exports.addLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { city, lat, lon, country, name } = req.body;

    const location = await db.location.create({
      data: { userId, city, lat, lon, country, name: name || city }
    });

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const userId = req.userId;

    const locations = await db.location.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' }
    });

    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    await db.location.deleteMany({ where: { id, userId } });

    res.json({ message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
