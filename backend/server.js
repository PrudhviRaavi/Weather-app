const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['API_KEY', 'DATABASE_URL', 'JWT_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('Please set these variables in your .env file or environment.');
  process.exit(1);
}

const app = express();
const { startScheduledJobs } = require('./utils/scheduledJobs');
const { verifyEmailConfig } = require('./utils/emailService');

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/history', require('./routes/history'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Weather API server running on port ${PORT}`);

  // Start scheduled jobs
  startScheduledJobs();

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    verifyEmailConfig().catch(() => {
      console.warn('Email service not fully configured. Alerts will not send emails.');
    });
  }
});
