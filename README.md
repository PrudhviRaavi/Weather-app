# 🌤️ Weather App

A modern, full-stack weather application with real-time weather data, interactive charts, and beautiful UI.

**Live Demo:** Coming Soon | **Status:** ✅ Production Ready

---

## ✨ Features

### 🎯 Core Weather Features
- 🌍 Real-time weather data for any location
- 📅 5-day forecast with hourly breakdowns
- 🌡️ Temperature, humidity, wind speed, and pressure data
- 🌫️ Air quality index (AQI) and pollutant information
- ☀️ UV index with health recommendations
- 🌅 Sunrise/sunset times
- 🌙 Moon phase calculation (8 phases with illumination %)

### 🎨 Enhanced UI Features
- 👤 Modern authentication (login/register) with password toggle
- 🎯 Feature showcase in login form
- 📊 Interactive weather trend charts (Temperature, Humidity, Wind, Pressure)
- 📈 Statistics dashboard (min/max/average)
- 🗺️ Interactive weather maps (Leaflet-based)
- 🌙 Full dark mode support
- 📱 Fully responsive design (mobile, tablet, desktop)

### 📢 Alert & Notification System
- 🚨 Create custom weather alerts
- 📧 Email notifications via Gmail SMTP
- ⏰ Scheduled daily weather summaries
- 🔔 Real-time alert triggers

### 📊 Historical Data & Analytics
- 📅 Track weather history by date range
- 📈 View historical statistics
- 💾 Store up to 90 days of data
- 🔍 Search and filter weather records

---

## 🛠 Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **Vite** - Frontend build tool
- **Tailwind CSS** - Utility-first styling
- **Chart.js** 4.x - Data visualization
- **Leaflet** 4.2.1 - Interactive maps
- **CSS Grid/Flexbox** - Responsive design
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Relational SQL database
- **Prisma** - Database ORM and migrations
- **Argon2id** - Password hashing
- **JWT in HttpOnly cookies** - Authentication
- **Nodemailer** - Email service
- **node-cron** - Job scheduling

### APIs
- **OpenWeatherMap** - Weather data (FREE tier)
  - Current weather
  - 5-day forecast
  - Air pollution
  - UV index

---

## 📋 Prerequisites

- **Node.js** 14+ and npm
- **Git**
- **OpenWeatherMap API Key** (free tier) - [Get one here](https://openweathermap.org/api)
- **Gmail account** (for email alerts - optional)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

### 4. Access the App
Open http://localhost:3000 in your browser

---

## 📁 Project Structure

```
weather-app/
├── backend/
│   ├── controllers/        # Business logic
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication, validators
│   ├── utils/              # Helper functions, APIs
│   ├── server.js           # Express app
│   ├── database.js         # Prisma client
│   ├── prisma/             # MySQL schema and migrations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── styles/         # CSS files
│   │   ├── services/       # API calls
│   │   ├── App.js          # Main component
│   │   └── index.js        # Entry point
│   ├── public/
│   └── package.json
│
└── README.md               # This file
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
# OpenWeatherMap API
API_KEY=your_api_key_here

# MySQL
DATABASE_URL=mysql://root:your_password@localhost:3306/weather_db

# Authentication
JWT_SECRET_KEY=your_secret_key_here

# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Never commit `.env` files with real keys. Use `.env.example` as template.

---

## 📚 API Endpoints

### Weather
- `GET /api/weather/:city` - Current weather
- `GET /api/forecast/:city` - 5-day forecast
- `GET /api/air-quality/:city` - Air quality data
- `GET /api/uv-index/:city` - UV index

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - Get user alerts
- `DELETE /api/alerts/:id` - Delete alert

### History
- `GET /api/history/city/:city` - Historical data
- `GET /api/history/stats` - Statistics

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

---

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Quick Deployment (Railway.app)
1. Push code to GitHub
2. Connect repository to Railway.app
3. Set environment variables
4. Deploy backend and frontend
5. Get live URL

---

## 🎯 Components Overview

### Frontend Components
- **WeatherCard** - Current weather display with 5-day forecast
- **AirQuality** - Air quality data and UV index
- **WeatherHistory** - Historical data and analysis
- **WeatherCharts** - Interactive trend visualization ✨ NEW
- **WeatherData** - Sun times, moon phase, wind details ✨ NEW
- **AuthForm** - Modern login/register interface ✨ NEW
- **Alerts** - Alert management
- **WeatherMap** - Interactive Leaflet map

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password encryption
- ✅ Environment variables for secrets
- ✅ HTTPS ready for production
- ✅ CORS enabled
- ✅ Input validation
- ✅ Error handling with no data leaks

---

## 📝 Project Details

- **Created:** February 2026
- **Version:** 1.0
- **Status:** Production Ready ✅
- **License:** MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment help
2. Review error messages in terminal logs
3. Check OpenWeatherMap API status
4. Verify all environment variables are set correctly

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 Acknowledgments

- **OpenWeatherMap** - Weather data API
- **Chart.js** - Data visualization library
- **Leaflet** - Map visualization
- **React** - UI framework
- **Express.js** - Backend framework

---

## Installation

### Backend Setup
```bash
cd backend
npm install
# Create .env file from .env.example
cp .env.example .env
# Add your API keys to .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file from .env.example
cp .env.example .env
npm start
```

### Database Setup
1. Create MySQL database named `weather_db`
2. Apply Prisma migrations:
```bash
cd backend
npx prisma migrate deploy
```

## Required API Keys

You'll need to obtain the following API keys:

1. **OpenWeatherMap API** - Free tier available
   - Sign up at: https://openweathermap.org/api
   - API Key: `API_KEY`
2. **Mapbox API** (Optional for maps)
   - Sign up at: https://www.mapbox.com
   - API Key: `MAPBOX_API_KEY`

## Environment Variables

### Backend (.env)
```
API_KEY=your_key
JWT_SECRET_KEY=your_secret
DATABASE_URL=mysql://root:your_password@localhost:3306/weather_db
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

1. Start MySQL database
2. Apply migrations: `cd backend && npx prisma migrate deploy`
3. Run backend: `cd backend && npm run dev`
4. Run frontend: `cd frontend && npm start`
5. Open http://localhost:3000 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Weather
- `GET /api/weather/city/:city` - Get weather by city
- `GET /api/weather/forecast/:city` - Get forecast
- `GET /api/weather/location?lat=x&lon=y` - Get weather by coordinates

### Locations
- `POST /api/locations` - Add favorite location
- `GET /api/locations` - Get all favorites
- `DELETE /api/locations/:id` - Delete location

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - Get alerts
- `DELETE /api/alerts/:id` - Delete alert

## Database Schema

Tables:
- `users` - User accounts and preferences
- `locations` - Favorite locations
- `weather_history` - Historical weather data
- `alerts` - Weather alerts
- `notifications` - User notifications

## Troubleshooting

### Issue: "Cannot find module"
- Run `npm install` in both backend and frontend directories

### Issue: "Port 5000 already in use"
- Change PORT in backend .env or kill the process using that port

### Issue: "Database connection failed"
- Ensure MySQL is running
- Check DB credentials in .env

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
