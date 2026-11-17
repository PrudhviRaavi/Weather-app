const cron = require('node-cron');
const db = require('../database');
const { sendDailySummary, sendAlertEmail } = require('./emailService');
const { getCurrentWeather } = require('./weatherAPI');

let scheduledJobs = {};

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

exports.startScheduledJobs = () => {
  console.log('Starting scheduled jobs...');
  scheduledJobs.dailySummary = cron.schedule('0 8 * * *', runDailySummaryJob);
  scheduledJobs.checkAlerts = cron.schedule('0 * * * *', checkAndTriggerAlertsJob);
  scheduledJobs.cleanup = cron.schedule('0 2 * * *', cleanupOldNotifications);
  console.log('Scheduled jobs started');
};

const runDailySummaryJob = async () => {
  try {
    const users = await db.user.findMany({
      select: { id: true, email: true, username: true, locations: { distinct: ['city'], take: 5, select: { city: true } } }
    });

    for (const user of users) {
      for (const location of user.locations) {
        try {
          const weather = await getCurrentWeather(location.city);
          await sendDailySummary(user, weather, location.city);
        } catch (error) {
          console.error(`Error fetching weather for ${location.city}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error in daily summary job:', error);
  }
};

const checkAndTriggerAlertsJob = async () => {
  try {
    const alerts = await db.alert.findMany({
      where: { isActive: true },
      include: { user: { select: { email: true } } }
    });

    for (const alert of alerts) {
      try {
        const weather = await getCurrentWeather(alert.city);
        const reason = evaluateAlert(alert, weather);
        if (!reason) continue;

        const recentNotification = await db.notification.findFirst({
          where: {
            alertId: alert.id,
            createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) }
          }
        });
        if (recentNotification) continue;

        await db.notification.create({
          data: { userId: alert.userId, alertId: alert.id, type: 'alert', message: reason }
        });
        await sendAlertEmail(
          alert.user,
          { city: alert.city, alertType: alert.alertType, threshold: alert.threshold, reason },
          weather
        );
      } catch (error) {
        console.error(`Error checking alert for ${alert.city}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in check alerts job:', error);
  }
};

const cleanupOldNotifications = async () => {
  try {
    const result = await db.notification.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
    });
    console.log(`Deleted ${result.count} old notifications`);
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
};

exports.stopScheduledJobs = () => {
  Object.values(scheduledJobs).forEach((job) => job.stop());
  scheduledJobs = {};
  console.log('All scheduled jobs stopped');
};
