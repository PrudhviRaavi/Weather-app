import React from 'react';
import { FaCloudSun, FaSmog, FaMapMarkedAlt, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import './styles/App.css';
import WeatherCard from './components/WeatherCard';
import AuthForm from './components/AuthForm';
import AirQuality from './components/AirQuality';
import WeatherMap from './components/WeatherMap';
import WeatherData from './components/WeatherData';
import { authService } from './services/api';

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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout endpoint unavailable; clearing the local session.');
    }
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
          <span className="app-logo-mark" aria-hidden="true">
            <FaCloudSun />
          </span>
          <h1>Weather App</h1>
        </div>
        {user && (
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
            <button className="temp-toggle" onClick={toggleTempUnit} title="Toggle temperature unit">
              °{tempUnit}
            </button>
            <div className="user-info">
              <span>{user.username || user.email}</span>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
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
            <FaCloudSun />
            <span>Weather</span>
          </button>
          <button
            className={`nav-btn ${currentPage === 'aqi' ? 'active' : ''}`}
            onClick={() => setCurrentPage('aqi')}
          >
            <FaSmog />
            <span>Air Quality</span>
          </button>
          <button
            className={`nav-btn ${currentPage === 'map' ? 'active' : ''}`}
            onClick={() => setCurrentPage('map')}
          >
            <FaMapMarkedAlt />
            <span>Map</span>
          </button>
        </nav>
      )}

      <main className="App-main">
        {!user ? (
          <AuthForm
            onLoginSuccess={setUser}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        ) : (
          <>
            {currentPage === 'weather' && (
              <div className="weather-page">
                <WeatherCard tempUnit={tempUnit} onCitySelect={setSelectedCity} />
                <WeatherData city={selectedCity} />
              </div>
            )}
            {currentPage === 'aqi' && <AirQuality city={selectedCity} />}
            {currentPage === 'map' && <WeatherMap city={selectedCity} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
