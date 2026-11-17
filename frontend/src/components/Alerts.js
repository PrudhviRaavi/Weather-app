import React, { useState, useEffect } from 'react';
import '../styles/Alerts.css';

const alertService = {
  createAlert: (data) => fetch('http://localhost:5000/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  getAlerts: () => fetch('http://localhost:5000/api/alerts', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(r => r.json()),
  
  updateAlert: (id, data) => fetch(`http://localhost:5000/api/alerts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  deleteAlert: (id) => fetch(`http://localhost:5000/api/alerts/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(r => r.json()),
  
  checkAlerts: () => fetch('http://localhost:5000/api/alerts/check-alerts', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(r => r.json()),
  
  getNotifications: () => fetch('http://localhost:5000/api/alerts/notifications', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(r => r.json()),
  
  markNotificationRead: (id) => fetch(`http://localhost:5000/api/alerts/notifications/${id}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(r => r.json())
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    city: '',
    alertType: 'temperature_high',
    threshold: 30,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadAlerts();
    loadNotifications();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await alertService.getAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError('Failed to load alerts');
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await alertService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (name === 'threshold' ? parseFloat(value) : value)
    });
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await alertService.createAlert({
        ...formData,
        userId: localStorage.getItem('userId')
      });
      
      if (result.id) {
        setAlerts([result, ...alerts]);
        setFormData({ city: '', alertType: 'temperature_high', threshold: 30, isActive: true });
        setShowForm(false);
      } else {
        setError(result.error || 'Failed to create alert');
      }
    } catch (err) {
      setError('Error creating alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      setError('Failed to delete alert');
    }
  };

  const handleCheckAlerts = async () => {
    try {
      const result = await alertService.checkAlerts();
      if (result.triggeredAlerts && result.triggeredAlerts.length > 0) {
        loadNotifications();
        setError(`${result.count} alert(s) triggered!`);
      } else {
        setError('No alerts triggered');
      }
    } catch (err) {
      setError('Error checking alerts');
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await alertService.markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h2>🚨 Weather Alerts</h2>
        <div className="alerts-controls">
          <button 
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Close' : '+ New Alert'}
          </button>
          <button 
            className="btn-secondary"
            onClick={handleCheckAlerts}
          >
            ⚡ Check Alerts Now
          </button>
          <button 
            className={`btn-notifications ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔 Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
        </div>
      </div>

      {error && <div className="alert-message error">{error}</div>}

      {/* Create Alert Form */}
      {showForm && (
        <div className="alert-form">
          <h3>Create New Alert</h3>
          <form onSubmit={handleCreateAlert}>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., London, Mumbai, New York"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Alert Type</label>
                <select
                  name="alertType"
                  value={formData.alertType}
                  onChange={handleInputChange}
                >
                  <option value="temperature_high">Temperature High</option>
                  <option value="temperature_low">Temperature Low</option>
                  <option value="rain">Rain Expected</option>
                  <option value="wind">Wind Speed High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Threshold Value</label>
                <input
                  type="number"
                  name="threshold"
                  value={formData.threshold}
                  onChange={handleInputChange}
                  placeholder="e.g., 30 for temp, 10 for wind"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⟳ Creating...' : '✓ Create Alert'}
            </button>
          </form>
        </div>
      )}

      {/* Alerts List */}
      <div className="alerts-list">
        <h3>Your Alerts ({alerts.length})</h3>
        {alerts.length === 0 ? (
          <p className="no-alerts">No alerts created yet. Create one to get started!</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${!alert.isActive ? 'disabled' : ''}`}>
              <div className="alert-info">
                <div className="alert-city">📍 {alert.city}</div>
                <div className="alert-type">
                  {alert.alert_type === 'temperature_high' && `🌡️ Temp > ${alert.threshold}°C`}
                  {alert.alert_type === 'temperature_low' && `❄️ Temp < ${alert.threshold}°C`}
                  {alert.alert_type === 'rain' && '🌧️ Rain Alert'}
                  {alert.alert_type === 'wind' && `💨 Wind > ${alert.threshold} m/s`}
                </div>
                <div className="alert-status">
                  {alert.isActive ? '✓ Active' : '✗ Inactive'}
                </div>
              </div>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteAlert(alert.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Notifications */}
      {showNotifications && (
        <div className="notifications-panel">
          <h3>Recent Notifications ({notifications.length})</h3>
          {notifications.length === 0 ? (
            <p>No notifications yet</p>
          ) : (
            <div className="notifications-list">
              {notifications.map(notif => (
                <div key={notif.id} className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}>
                  <div className="notif-content">
                    <div className="notif-message">⚠️ {notif.message}</div>
                    <div className="notif-meta">
                      {notif.city && <span>📍 {notif.city}</span>}
                      <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {!notif.is_read && (
                    <button
                      className="btn-mark-read"
                      onClick={() => handleMarkNotificationRead(notif.id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Alerts;
