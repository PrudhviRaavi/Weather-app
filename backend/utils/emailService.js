const nodemailer = require('nodemailer');

// Configure your email service here
// For Gmail: https://myaccount.google.com/apppasswords (generate app password)
// For other services, use appropriate credentials

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates
const emailTemplates = {
  dailySummary: (user, weatherData, city) => ({
    subject: `☀️ Daily Weather Summary - ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fafc; padding: 20px; border-radius: 8px;">
        <h1 style="color: #667eea; text-align: center;">🌤️ Daily Weather Summary</h1>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h2 style="color: #2d3748; margin: 0 0 10px 0;">${city}</h2>
          <p style="color: #718096; margin: 5px 0;"><strong>Temperature:</strong> ${weatherData.main.temp}°C</p>
          <p style="color: #718096; margin: 5px 0;"><strong>Condition:</strong> ${weatherData.weather[0].main}</p>
          <p style="color: #718096; margin: 5px 0;"><strong>Humidity:</strong> ${weatherData.main.humidity}%</p>
          <p style="color: #718096; margin: 5px 0;"><strong>Wind Speed:</strong> ${weatherData.wind.speed} m/s</p>
          <p style="color: #718096; margin: 5px 0;"><strong>Pressure:</strong> ${weatherData.main.pressure} hPa</p>
        </div>
        
        <div style="text-align: center; color: #718096; font-size: 12px; margin-top: 20px;">
          <p>This is an automated email from Weather App. Check your alerts and stay informed!</p>
        </div>
      </div>
    `
  }),

  alertTriggered: (user, alert, weather) => ({
    subject: `⚠️ Weather Alert Triggered - ${alert.city}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b;">
        <h1 style="color: #ff6b6b; text-align: center;">⚠️ Weather Alert</h1>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin: 0 0 15px 0;">Alert Details</h2>
          <p style="color: #718096; margin: 10px 0;"><strong>City:</strong> ${alert.city}</p>
          <p style="color: #718096; margin: 10px 0;"><strong>Alert Type:</strong> ${alert.alertType}</p>
          <p style="color: #718096; margin: 10px 0;"><strong>Threshold:</strong> ${alert.threshold}</p>
          <p style="color: #718096; margin: 10px 0;"><strong>Current Condition:</strong> ${alert.reason}</p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="http://localhost:3000" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View in App
          </a>
        </div>
      </div>
    `
  })
};

// Send email function
exports.sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'weather-app@example.com',
      to,
      subject,
      html
    });
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Send daily summary email
exports.sendDailySummary = async (user, weatherData, city) => {
  try {
    const template = emailTemplates.dailySummary(user, weatherData, city);
    await exports.sendEmail(user.email, template.subject, template.html);
    console.log(`Daily summary sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending daily summary:', error);
  }
};

// Send alert triggered email
exports.sendAlertEmail = async (user, alert, weather) => {
  try {
    const template = emailTemplates.alertTriggered(user, alert, weather);
    await exports.sendEmail(user.email, template.subject, template.html);
    console.log(`Alert email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending alert email:', error);
  }
};

// Verify email configuration
exports.verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service configured and ready');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
};
