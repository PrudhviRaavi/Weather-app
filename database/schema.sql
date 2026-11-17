-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  theme VARCHAR(50) DEFAULT 'light',
  temperature_unit VARCHAR(1) DEFAULT 'C',
  language VARCHAR(50) DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Locations (Favorites) Table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  city VARCHAR(100) NOT NULL,
  lat FLOAT,
  lon FLOAT,
  country VARCHAR(100),
  name VARCHAR(100),
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Weather History Table
CREATE TABLE weather_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location VARCHAR(100),
  temperature FLOAT,
  humidity INT,
  wind_speed FLOAT,
  condition VARCHAR(100),
  recorded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Alerts Table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location VARCHAR(100) NOT NULL,
  alert_type VARCHAR(50), -- rain, wind, temp, etc
  threshold_value FLOAT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- alert, forecast, summary
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  scheduled_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_weather_history_user_id ON weather_history(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
