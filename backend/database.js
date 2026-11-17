const Database = require('better-sqlite3');
const path = require('path');

// Create/open database file
const db = new Database(path.join(__dirname, '../weather_app.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDb = () => {
  db.exec(`
    -- Create Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT,
      theme TEXT DEFAULT 'light',
      temperature_unit TEXT DEFAULT 'C',
      language TEXT DEFAULT 'en',
      email_notifications INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Locations (Favorites) Table
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      city TEXT NOT NULL,
      lat REAL,
      lon REAL,
      country TEXT,
      name TEXT,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create Weather History Table
    CREATE TABLE IF NOT EXISTS weather_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      location TEXT,
      temperature REAL,
      humidity INTEGER,
      wind_speed REAL,
      condition TEXT,
      recorded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create Alerts Table
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      location TEXT NOT NULL,
      alert_type TEXT,
      threshold_value REAL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create Notifications Table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      scheduled_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
    CREATE INDEX IF NOT EXISTS idx_weather_history_user_id ON weather_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  `);
};

// Initialize database on startup
initDb();

module.exports = db;
