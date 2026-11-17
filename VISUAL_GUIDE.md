# Visual Setup Flow

## Your Setup Journey

```
START HERE
    ↓
┌─────────────────────────┐
│  Install Prerequisites  │
│ - Node.js              │
│ - MySQL               │
│ Time: 10 minutes       │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  Get API Keys           │
│ - OpenWeatherMap       │
│ - JWT Secret (gen)     │
│ Time: 5 minutes        │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  Setup Database         │
│ - Create weather_db    │
│ - Run Prisma migration │
│ Time: 3 minutes        │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  Setup Backend          │
│ - Copy .env.example    │
│ - Add API keys         │
│ - npm install & run    │
│ Time: 3 minutes        │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  Setup Frontend         │
│ - Copy .env.example    │
│ - npm install & run    │
│ Time: 3 minutes        │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  Test Everything        │
│ - Register account     │
│ - Search weather       │
│ - View results         │
│ Time: 2 minutes        │
└─────────────────────────┘
    ↓
    ✅ SUCCESS!
```

---

## Data Flow Diagram

```
User's Browser
    │
    ├─── HTTP Request ─────────────────────┐
    │                                       ↓
    │                              React Frontend
    │                              (localhost:3000)
    │                                       │
    │                     ┌─────────────────┘
    │                     │
    │                     ├─ Validates input
    │                     ├─ Adds JWT token
    │                     └─ Sends API request
    │                            │
    ├──← HTTP Response ──────────┤
    │                            ↓
    │                    Express Backend
    │                  (localhost:5000)
    │                            │
    │            ┌───────────────┼───────────────┐
    │            │               │               │
    │     Check JWT Token   Get Weather Data  Query Database
    │            │          from OpenWeatherMap   │
    │            └───────────────┼───────────────┘
    │                            │
    │     ┌──────────────────────┤
    │     ↓                      ↓
    │  MySQL                 OpenWeatherMap API
    │  Database              (openweathermap.org)
    │
    └──── JSON Response with Weather Data ────
```

---

## File Organization Visual

```
Frontend (React)
    │
    ├─ API Calls (Axios)
    │   └─ services/api.js
    │
    ├─ Components
    │   ├─ AuthForm (Login)
    │   └─ WeatherCard (Display)
    │
    ├─ Styling
    │   ├─ App.css
    │   ├─ Auth.css
    │   └─ WeatherCard.css
    │
    └─ State Management
        └─ React Hooks (useState)


    ↓ API Calls ↓

Backend (Express)
    │
    ├─ Routes
    │   ├─ auth.js
    │   ├─ weather.js
    │   └─ locations.js
    │
    ├─ Controllers
    │   ├─ authController.js
    │   └─ weatherController.js
    │
    ├─ Middleware
    │   └─ auth.js (JWT verify)
    │
    ├─ Utils
    │   ├─ auth.js (hash, token)
    │   └─ weatherAPI.js (API calls)
    │
    └─ Database Connection
        └─ database.js


    ↓ SQL Queries ↓

MySQL
    │
    ├─ users (accounts)
    ├─ locations (favorites)
    ├─ weather_history
    ├─ alerts
    └─ notifications
```

---

## API Request Chain

```
1. User types "London" in search box
   │
2. onClick → handleSearch() in WeatherCard.js
   │
3. Call weatherService.getWeatherByCity('London')
   │
4. Axios sends GET /api/weather/city/London
   │
5. Express server receives request
   │
6. Routes to weatherController.js
   │
7. Controller calls weatherAPI.js
   │
8. weatherAPI.js calls OpenWeatherMap API
   │
9. Gets JSON with weather data
   │
10. Returns to Express controller
    │
11. Controller sends response back
    │
12. Frontend receives response
    │
13. setWeather(data) updates state
    │
14. Component re-renders
    │
15. User sees weather! 🌤️
```

---

## Authentication Flow

```
User Clicks Register with:
- Email: test@example.com
- Password: <example-password>
- Username: testuser

           ↓

Frontend Form Submission
(AuthForm.js)

           ↓

POST /api/auth/register
{
  email,
  password,
  username
}

           ↓

Backend authController.js
- Check if email exists
- Hash password with bcryptjs
- Create new user in database
- Generate JWT token

           ↓

Response with:
{
  user: { id, email, username },
  token: "eyJhbGciOi..."
}

           ↓

Frontend Stores:
- localStorage.setItem('token', token)
- localStorage.setItem('user', JSON.stringify(user))
- setUser(user) updates state

           ↓

App shows Weather page instead of login
User is logged in! ✅
```

---

## Environment Variables Map

```
Frontend (.env)
┌──────────────────────────────────────┐
│ VITE_API_URL=                        │
│ http://localhost:5000/api            │
└──────────────────────────────────────┘
         ↓
    Used in services/api.js
    to make API requests


Backend (.env)
┌──────────────────────────────────────┐
│ API_KEY=xxx                          │ ← Get from OpenWeatherMap
│ JWT_SECRET_KEY=xxx                   │ ← Generate locally
│ DATABASE_URL=mysql://...             │ ← MySQL connection
│ PORT=5000                            │ ← Backend port
│ NODE_ENV=development                 │ ← Development mode
│ FRONTEND_URL=http://localhost:3000   │ ← CORS allowed URL
└──────────────────────────────────────┘
```

---

## Login/Request Security

```
Login Process
┌─────────────────────────────────────────┐
│ 1. User enters email & password         │
│ 2. Frontend hashes password (client)    │
│ 3. Sent to backend                      │
│ 4. Backend hashes received password     │
│ 5. Compares with stored hash            │
│ 6. If match: Generate JWT token        │
│ 7. Return token to frontend             │
│ 8. Frontend saves in localStorage       │
└─────────────────────────────────────────┘

Protected Request
┌─────────────────────────────────────────┐
│ 1. User requests /locations             │
│ 2. Frontend adds header:                │
│    Cookie: HttpOnly JWT cookie          │
│ 3. Backend middleware verifies token    │
│ 4. If valid: Continue to handler        │
│ 5. If invalid: Return 401 Unauthorized  │
│ 6. Handler queries database with userId │
│ 7. Returns only user's data             │
└─────────────────────────────────────────┘
```

---

## Database Queries

```
User Favorite Location Flow
┌──────────────────────────────────────┐

ADD FAVORITE:
1. User clicks "Add to Favorites"
2. Frontend: POST /api/locations
   {city: "Paris", lat: 48.8, lon: 2.3}
3. Backend inserts into locations table:
   INSERT INTO locations
   (user_id, city, lat, lon)
   VALUES ($1, $2, $3, $4)
   RETURNING *
4. Return new location object

GET FAVORITES:
1. User wants to see saved locations
2. Frontend: GET /api/locations
3. Backend queries:
   SELECT * FROM locations
   WHERE user_id = $1
4. Return array of all locations

DELETE FAVORITE:
1. User clicks delete on location
2. Frontend: DELETE /api/locations/:id
3. Backend deletes:
   DELETE FROM locations
   WHERE id = $1 AND user_id = $2
4. Return success message
└──────────────────────────────────────┘
```

---

## Response Times

```
Typical Request Latency
┌──────────────────────────┐
├─ Frontend process: 5ms   │
├─ Network transfer: 10ms  │
├─ Backend process: 20ms   │
├─ Database query: 15ms    │
├─ External API: 500ms*    │
├─ Response send: 10ms     │
├─ Network back: 10ms      │
├─ Frontend render: 20ms   │
└──────────────────────────┘
  Total: ~590ms

*OpenWeatherMap API calls vary
 Weather requests slower
 Database queries faster
```

---

## Browser DevTools Debugging

```
Open Browser Console (F12)

Check Authentication:
1. Open Application/Storage tab
2. LocalStorage
3. Look for 'token' and 'user'
4. Verify values exist

Check Network Requests:
1. Open Network tab
2. Make a search request
3. Click request → Headers tab
4. Verify Authorization header present
5. Check response status (200 = good)

Check Errors:
1. Open Console tab
2. Look for red error messages
3. Check stack trace
4. Fix accordingly
```

---

## Deployment Architecture (Future)

```
Current (Development)
┌─────────────┐
│   Frontend  │ localhost:3000
│  (React)    │
└─────────────┘
       │
       │ localhost:5000
       ↓
┌─────────────┐
│   Backend   │
│ (Express)   │
└─────────────┘
       │
       │ localhost:5432
       ↓
┌─────────────┐
│  MySQL      │
│  (Database) │
└─────────────┘


Production (Deployment)
┌──────────────────┐
│  Vercel/Netlify  │ Frontend
│   (Frontend)     │ Static hosting
└──────────────────┘
        │
        │ API Calls
        ↓
┌──────────────────┐
│ Heroku/AWS/DO    │ Backend
│  (Backend)       │ Server
└──────────────────┘
        │
        │ Database queries
        ↓
┌──────────────────┐
│ AWS RDS/MongoDB  │ Database
│   (Database)     │ Managed DB
└──────────────────┘
```

---

## Project Completion Status

```
✅ COMPLETE       IN PROGRESS      ⏳ FUTURE
┌─────────────┐  ┌──────────────┐  ┌────────────┐
├─ Backend    │  │ Documentation│  │ Maps       │
├─ Frontend   │  └──────────────┘  ├─ Analytics │
├─ Database   │                    ├─ Mobile    │
├─ Auth       │                    └────────────┘
├─ API        │
├─ Routes     │
├─ Docs       │
└─ Structure  │
```

---

This visual guide complements the detailed documentation!
