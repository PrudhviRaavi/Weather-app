const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const { getCurrentWeather } = require('../utils/weatherAPI');

// Create alert
exports.createAlert = (req, res) => {
  try {
    const { userId, city, alertType, threshold, isActive } = req.body;
    
    if (!city || !alertType || threshold === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const alertId = uuidv4();
    const createdAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO alerts (id, user_id, city, alert_type, threshold, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(alertId, userId, city, alertType, threshold, isActive ? 1 : 0, createdAt, createdAt);
    
    res.status(201).json({ 
      id: alertId, 
      userId, 
      city, 
      alertType, 
      threshold, 
      isActive: !!isActive,
      createdAt 
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
};

// Get user alerts
exports.getAlerts = (req, res) => {
  try {
    const userId = req.user.id;
    
    const stmt = db.prepare('SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC');
    const alerts = stmt.all(userId);
    
    res.json(alerts.map(a => ({
      ...a,
      isActive: !!a.is_active
    })));
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

// Update alert
exports.updateAlert = (req, res) => {
  try {
    const { id } = req.params;
    const { city, alertType, threshold, isActive } = req.body;
    const userId = req.user.id;
    
    const stmt = db.prepare('SELECT * FROM alerts WHERE id = ? AND user_id = ?');
    const alert = stmt.get(id, userId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    const updateStmt = db.prepare(`
      UPDATE alerts 
      SET city = ?, alert_type = ?, threshold = ?, is_active = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);
    
    const updatedAt = new Date().toISOString();
    updateStmt.run(city, alertType, threshold, isActive ? 1 : 0, updatedAt, id, userId);
    
    res.json({ 
      id, 
      city, 
      alertType, 
      threshold, 
      isActive: !!isActive,
      updatedAt 
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
};

// Delete alert
exports.deleteAlert = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const stmt = db.prepare('SELECT * FROM alerts WHERE id = ? AND user_id = ?');
    const alert = stmt.get(id, userId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    const deleteStmt = db.prepare('DELETE FROM alerts WHERE id = ? AND user_id = ?');
    deleteStmt.run(id, userId);
    
    res.json({ message: 'Alert deleted', id });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
};

// Check and trigger alerts
exports.checkAndTriggerAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const alertsStmt = db.prepare('SELECT * FROM alerts WHERE user_id = ? AND is_active = 1');
    const activeAlerts = alertsStmt.all(userId);
    
    const triggeredAlerts = [];
    
    for (const alert of activeAlerts) {
      try {
        const weather = await getCurrentWeather(alert.city);
        const temp = weather.main.temp;
        const condition = weather.weather[0].main.toLowerCase();
        
        let isTriggered = false;
        let triggerReason = '';
        
        // Check alert conditions
        if (alert.alert_type === 'temperature_high' && temp > alert.threshold) {
          isTriggered = true;
          triggerReason = `Temperature ${temp}°C exceeds ${alert.threshold}°C`;
        } else if (alert.alert_type === 'temperature_low' && temp < alert.threshold) {
          isTriggered = true;
          triggerReason = `Temperature ${temp}°C below ${alert.threshold}°C`;
        } else if (alert.alert_type === 'rain' && (condition.includes('rain') || condition.includes('drizzle'))) {
          isTriggered = true;
          triggerReason = `Rain detected in ${alert.city}`;
        } else if (alert.alert_type === 'wind' && weather.wind.speed > alert.threshold) {
          isTriggered = true;
          triggerReason = `Wind speed ${weather.wind.speed} m/s exceeds ${alert.threshold} m/s`;
        }
        
        if (isTriggered) {
          triggeredAlerts.push({
            alertId: alert.id,
            city: alert.city,
            alertType: alert.alert_type,
            threshold: alert.threshold,
            currentValue: alert.alert_type === 'rain' ? condition : (alert.alert_type === 'wind' ? weather.wind.speed : temp),
            reason: triggerReason,
            triggeredAt: new Date().toISOString()
          });
          
          // Store notification in database
          const notificationId = uuidv4();
          const notifStmt = db.prepare(`
            INSERT INTO notifications (id, user_id, alert_id, message, is_read, created_at)
            VALUES (?, ?, ?, ?, 0, ?)
          `);
          notifStmt.run(notificationId, userId, alert.id, triggerReason, new Date().toISOString());
        }
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

// Get notifications
exports.getNotifications = (req, res) => {
  try {
    const userId = req.user.id;
    
    const stmt = db.prepare(`
      SELECT n.*, a.city, a.alert_type 
      FROM notifications n
      LEFT JOIN alerts a ON n.alert_id = a.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `);
    
    const notifications = stmt.all(userId);
    res.json(notifications.map(n => ({
      ...n,
      isRead: !!n.is_read
    })));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
exports.markNotificationAsRead = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const stmt = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?');
    const notif = stmt.get(id, userId);
    
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const updateStmt = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?');
    updateStmt.run(id);
    
    res.json({ message: 'Notification marked as read', id });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};
