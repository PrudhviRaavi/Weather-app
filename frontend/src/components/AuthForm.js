import React, { useState } from 'react';
import { FaCloudSun, FaEye, FaEyeSlash, FaMoon, FaSignInAlt, FaSun, FaUserPlus } from 'react-icons/fa';
import { authService } from '../services/api';
import '../styles/Auth.css';

const AuthForm = ({ onLoginSuccess, theme, onToggleTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isLogin) {
        response = await authService.login(email, password);
      } else {
        response = await authService.register(email, password, username);
      }
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={onToggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-mark" aria-hidden="true">
            <FaCloudSun />
          </div>
          <h1>Weather App</h1>
          <p>{isLogin ? 'Welcome Back!' : 'Join Us Today!'}</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>👤 Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose your username"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label>📧 Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>🔐 Password</label>
            <div className="password-group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                {isLogin ? <FaSignInAlt /> : <FaUserPlus />}
                <span>{isLogin ? 'Login' : 'Register'}</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="toggle-link"
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

        <div className="auth-features">
          <p>✨ Get instant access to:</p>
          <ul>
            <li>🌍 Real-time weather anywhere</li>
            <li>🗺️ Interactive weather maps</li>
            <li>🌫️ Air quality information</li>
            <li>🌗 Light and dark themes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
