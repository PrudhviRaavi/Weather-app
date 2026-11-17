const db = require('../database');
const { getCurrentWeather } = require('../utils/weatherAPI');

const mapAlert = (alert) => ({
  ...alert,
  isActive: alert.isActive
});

const evaluateAlert = (alert, weather) => {
  const temperature = weather.main.temp;
  const condition = weather.weather[0].main.toLowerCase();

  if (alert.alertType === 'temperature_high' && temperature > alert.threshold) {
    return `Temperature ${temperature}°C exceeds ${alert.threshold}°C`;
  }
  if (alert.alertType === 'temperature_low' && temperature < alert.threshold) {
    return `Temperature ${temperature}°C below ${alert.threshold}°C`;
  }
  if (alert.alertType === 'rain' && (condition.includes('rain') || condition.includes('drizzle'))) {
    return `Rain detected in ${alert.city}`;
  }
  if (alert.alertType === 'wind' && weather.wind.speed > alert.threshold) {
    return `Wind speed ${weather.wind.speed} m/s exceeds ${alert.threshold} m/s`;
  }
  return null;
};

exports.createAlert = async (req, res) => {
  try {
    const { city, alertType, threshold, isActive } = req.body;
    if (!city || !alertType || threshold === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const alert = await db.alert.create({
      data: {
        userId: req.userId,
        city,
        alertType,
        threshold: Number(threshold),
        isActive: isActive !== false
      }
    });
    res.status(201).json(mapAlert(alert));
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await db.alert.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts.map(mapAlert));
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { city, alertType, threshold, isActive } = req.body;
    const existing = await db.alert.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: 'Alert not found' });

    const alert = await db.alert.update({
      where: { id },
      data: {
        city,
        alertType,
        threshold: Number(threshold),
        isActive: Boolean(isActive)
      }
    });
    res.json(mapAlert(alert));
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const result = await db.alert.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    if (!result.count) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Alert deleted', id: req.params.id });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
};

exports.checkAndTriggerAlerts = async (req, res) => {
  try {
    const activeAlerts = await db.alert.findMany({
      where: { userId: req.userId, isActive: true }
    });
    const triggeredAlerts = [];

    for (const alert of activeAlerts) {
      try {
        const weather = await getCurrentWeather(alert.city);
        const reason = evaluateAlert(alert, weather);
        if (!reason) continue;

        const notification = await db.notification.create({
          data: {
            userId: req.userId,
            alertId: alert.id,
            type: 'alert',
            message: reason
          }
        });
        triggeredAlerts.push({
          alertId: alert.id,
          city: alert.city,
          alertType: alert.alertType,
          threshold: alert.threshold,
          reason,
          triggeredAt: notification.createdAt
        });
      } catch (error) {
        console.error(`Error checking alert for ${alert.city}:`, error.message);
      }
    }
    res.json({ triggeredAlerts, count: triggeredAlerts.length });
  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({ error: 'Failed to check alerts' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await db.notification.findMany({
      where: { userId: req.userId },
      include: { alert: { select: { city: true, alertType: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications.map((notification) => ({
      ...notification,
      city: notification.alert?.city,
      alert_type: notification.alert?.alertType,
      isRead: notification.isRead
    })));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const result = await db.notification.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: { isRead: true }
    });
    if (!result.count) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification marked as read', id: req.params.id });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};
