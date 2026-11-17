import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth services
export const authService = {
  register: (email, password, username) =>
    api.post('/auth/register', { email, password, username }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout')
};

// Weather services
export const weatherService = {
  getWeatherByCity: (city) =>
    api.get(`/weather/city/${city}`),
  getForecast: (city) =>
    api.get(`/weather/forecast/${city}`),
  getWeatherByLocation: (lat, lon) =>
    api.get('/weather/location', { params: { lat, lon } }),
  getAirQuality: (city) =>
    api.get(`/weather/aqi/${city}`),
  getUVIndex: (city) =>
    api.get(`/weather/uv/${city}`)
};

// Location services
export const locationService = {
  addLocation: (data) =>
    api.post('/locations', data),
  getLocations: () =>
    api.get('/locations'),
  deleteLocation: (id) =>
    api.delete(`/locations/${id}`)
};

export default api;
