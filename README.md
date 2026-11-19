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
│   ├── railway.json
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

The backend deployment configuration is [backend/railway.json](./backend/railway.json).

Deploy `backend/` as a Railway service and configure:

- `API_KEY`
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `NODE_ENV=production`
- `PORT=5000`
- `FRONTEND_URL=https://your-vercel-domain`

The backend start command runs Prisma migrations before starting Express.

### Vercel frontend

The frontend deployment configuration is [frontend/vercel.json](./frontend/vercel.json).

Deploy `frontend/` as a Vercel project and set:

```env
VITE_API_URL=https://your-railway-backend/api
```

Set `FRONTEND_URL` on Railway to the exact Vercel origin. Use HTTPS and a production cookie configuration when authentication spans different domains.

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
