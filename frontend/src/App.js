import React from 'react';
import './styles/App.css';
import WeatherCard from './components/WeatherCard';
import AuthForm from './components/AuthForm';
import Alerts from './components/Alerts';
import WeatherHistory from './components/WeatherHistory';
import AirQuality from './components/AirQuality';
import WeatherMap from './components/WeatherMap';
import WeatherData from './components/WeatherData';

function App() {
  const [user, setUser] = React.useState(null);
  const [tempUnit, setTempUnit] = React.useState('C');
  const [theme, setTheme] = React.useState('light');
  const [currentPage, setCurrentPage] = React.useState('weather');
  const [selectedCity, setSelectedCity] = React.useState('London');

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUnit = localStorage.getItem('tempUnit') || 'C';
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      localStorage.setItem('userId', JSON.parse(savedUser).id);
    }
    setTempUnit(savedUnit);
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTempUnit = () => {
    const newUnit = tempUnit === 'C' ? 'F' : 'C';
    setTempUnit(newUnit);
    localStorage.setItem('tempUnit', newUnit);
  };

  return (
    <div className="App" data-theme={theme}>
      <header className="App-header">
        <div className="header-left">
          <h1>🌤️ Weather App</h1>
        </div>
        {user && (
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="temp-toggle" onClick={toggleTempUnit} title="Toggle temperature unit">
              °{tempUnit}
            </button>
            <div className="user-info">
              <span>{user.username || user.email}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}
      </header>

      {user && (
        <nav className="app-nav">
          <button
            className={`nav-btn ${currentPage === 'weather' ? 'active' : ''}`}
            onClick={() => setCurrentPage('weather')}
          >
            🌤️ Weather
          </button>
          <button
            className={`nav-btn ${currentPage === 'alerts' ? 'active' : ''}`}
            onClick={() => setCurrentPage('alerts')}
          >
            🚨 Alerts
          </button>
          <button
            className={`nav-btn ${currentPage === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentPage('history')}
          >
            📊 History
          </button>
          <button
            className={`nav-btn ${currentPage === 'aqi' ? 'active' : ''}`}
            onClick={() => setCurrentPage('aqi')}
          >
            🌫️ Air Quality
          </button>
          <button
            className={`nav-btn ${currentPage === 'map' ? 'active' : ''}`}
            onClick={() => setCurrentPage('map')}
          >
            🗺️ Map
          </button>
        </nav>
      )}

      <main className="App-main">
        {!user ? (
          <AuthForm onLoginSuccess={setUser} />
        ) : (
          <>
            {currentPage === 'weather' && (
              <div className="weather-page">
                <WeatherCard tempUnit={tempUnit} onCitySelect={setSelectedCity} />
                <WeatherData city={selectedCity} />
              </div>
            )}
            {currentPage === 'alerts' && <Alerts />}
            {currentPage === 'history' && <WeatherHistory city={selectedCity} tempUnit={tempUnit} />}
            {currentPage === 'aqi' && <AirQuality city={selectedCity} />}
            {currentPage === 'map' && <WeatherMap city={selectedCity} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
