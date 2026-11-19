# Weather App

A full-stack weather application for searching current weather, forecasts, air quality, UV index, favorite locations, and an interactive Leaflet map.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, Axios, Leaflet
- Backend: Node.js, Express.js
- Database: MySQL
- ORM: Prisma
- Authentication: JWT in HttpOnly cookies
- Password hashing: Argon2

## Features

- User registration and login
- Secure logout
- Current weather search
- Five-day forecast
- Air quality and UV index
- Favorite locations
- Interactive weather map
- Light/dark theme
- Celsius/Fahrenheit temperature toggle
- Responsive layout

## Prerequisites

- Node.js 18+
- npm
- MySQL
- OpenWeatherMap API key

## Setup

### 1. Create the database

```sql
CREATE DATABASE weather_db;
```

### 2. Configure the backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run db:migrate
npm run dev
```

Set these values in `backend/.env`:

```env
API_KEY=your_openweathermap_api_key
JWT_SECRET_KEY=your_random_jwt_secret
DATABASE_URL=mysql://root:your_password@localhost:3306/weather_db
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Configure the frontend

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Set `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Open `http://localhost:3000`.

## API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Weather

- `GET /api/weather/city/:city`
- `GET /api/weather/forecast/:city`
- `GET /api/weather/location?lat=x&lon=y`
- `GET /api/weather/aqi/:city`
- `GET /api/weather/uv/:city`

### Locations

- `POST /api/locations`
- `GET /api/locations`
- `DELETE /api/locations/:id`

## Database

Prisma manages the MySQL schema and migrations:

```powershell
cd backend
npm run db:generate
npm run db:migrate
```

The repository preserves earlier migration folders for migration-history compatibility. Those legacy migrations may create tables that are no longer used by active application code; the application no longer registers Alerts, History, notification routes, or jobs. No migration in this repository automatically deletes existing data.

## Project Structure

```text
weatherapp/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── prisma/
│   ├── routes/
│   ├── utils/
│   ├── database.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   └── services/
│   ├── index.html
│   ├── vite.config.js
│   └── vercel.json
└── README.md
```

## Production Deployment

### Railway backend

The backend is deployed from the `backend/` directory on Railway. Create or use a Railway MySQL database and configure these service variables:

- `API_KEY`
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `NODE_ENV=production`
- `PORT=5000`
- `FRONTEND_URL=https://your-vercel-domain`

Recommended Railway service settings:

- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

The start command runs `prisma migrate deploy` before starting Express. Set `FRONTEND_URL` to the exact Vercel origin, including `https://` and no trailing path.

### Vercel frontend

The frontend is deployed on Vercel from the `frontend/` directory. Set this environment variable for the Vercel project:

```env
VITE_API_URL=https://your-railway-backend/api
```

Recommended Vercel settings:

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

The frontend already includes `frontend/vercel.json` SPA routing configuration. Because Vercel and Railway use different domains, authentication requires HTTPS cookies with `SameSite=None` in production, and the Railway `FRONTEND_URL` must match the Vercel origin.

## Build

```powershell
cd frontend
npm run build
```

## Security

- Never commit real `.env` files.
- Rotate any API key or secret that may have been exposed.
- Use HTTPS and secure cookies in production.
- Keep `JWT_SECRET_KEY` secret and random.
