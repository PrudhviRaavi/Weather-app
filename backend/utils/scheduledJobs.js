const cron = require('node-cron');
const db = require('../database');
const { sendDailySummary, sendAlertEmail } = require('./emailService');
const { getCurrentWeather } = require('./weatherAPI');
const { v4: uuidv4 } = require('uuid');

let scheduledJobs = {};

// Start all scheduled jobs
exports.startScheduledJobs = () => {
  console.log('Starting scheduled jobs...');
  
  // Run daily weather summary at 8:00 AM
  scheduledJobs.dailySummary = cron.schedule('0 8 * * *', async () => {
    console.log('Running daily weather summary job...');
    await runDailySummaryJob();
  });

  // Check alerts every hour
  scheduledJobs.checkAlerts = cron.schedule('0 * * * *', async () => {
    console.log('Checking alerts...');
    await checkAndTriggerAlertsJob();
  });

  // Run daily cleanup at 2:00 AM
  scheduledJobs.cleanup = cron.schedule('0 2 * * *', async () => {
    console.log('Running cleanup job...');
    await cleanupOldNotifications();
  });

  console.log('✓ Scheduled jobs started');
};

// Daily summary job
const runDailySummaryJob = async () => {
  try {
    const userStmt = db.prepare('SELECT id, email, username FROM users');
    const users = userStmt.all();

    for (const user of users) {
      try {
        const favoritesStmt = db.prepare('SELECT DISTINCT city FROM locations WHERE user_id = ? LIMIT 5');
        const favorites = favoritesStmt.all(user.id);

        if (favorites.length === 0) continue;

        // Send summary for each favorite city
        for (const fav of favorites) {
          try {
            const weather = await getCurrentWeather(fav.city);
            await sendDailySummary(user, weather, fav.city);
          } catch (error) {
            console.error(`Error fetching weather for ${fav.city}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`Error processing daily summary for user ${user.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in dailySummary job:', error);
  }
};

// Check and trigger alerts job
const checkAndTriggerAlertsJob = async () => {
  try {
    const alertsStmt = db.prepare(`
      SELECT a.*, u.email FROM alerts a
      JOIN users u ON a.user_id = u.id
      WHERE a.is_active = 1
    `);
    const activeAlerts = alertsStmt.all();

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
          // Check if we already sent an email for this in the last hour
          const lastNotifStmt = db.prepare(`
            SELECT * FROM notifications 
            WHERE alert_id = ? AND created_at > datetime('now', '-1 hour')
          `);
          const lastNotif = lastNotifStmt.get(alert.id);

          if (!lastNotif) {
            // Store notification
            const notificationId = uuidv4();
            const notifStmt = db.prepare(`
              INSERT INTO notifications (id, user_id, alert_id, message, is_read, created_at)
              VALUES (?, ?, ?, ?, 0, ?)
            `);
            notifStmt.run(notificationId, alert.user_id, alert.id, triggerReason, new Date().toISOString());

            // Send email if enabled
            try {
              await sendAlertEmail(
                { email: alert.email },
                {
                  city: alert.city,
                  alertType: alert.alert_type,
                  threshold: alert.threshold,
                  reason: triggerReason
                },
                weather
              );
            } catch (error) {
              console.error('Error sending alert email:', error.message);
            }
          }
        }
      } catch (error) {
        console.error(`Error checking alert for ${alert.city}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in checkAlerts job:', error);
  }
};

// Cleanup old notifications (older than 30 days)
const cleanupOldNotifications = async () => {
  try {
    const deleteStmt = db.prepare(`
      DELETE FROM notifications 
      WHERE created_at < datetime('now', '-30 days')
    `);
    deleteStmt.run();
    console.log('✓ Cleanup job completed');
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
};

// Stop all scheduled jobs
exports.stopScheduledJobs = () => {
  Object.values(scheduledJobs).forEach(job => job.stop());
  console.log('✓ All scheduled jobs stopped');
};
