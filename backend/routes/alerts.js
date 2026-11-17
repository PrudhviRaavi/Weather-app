const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const alertsController = require('../controllers/alertsController');

// Alert CRUD operations
router.post('/', verifyToken, alertsController.createAlert);
router.get('/', verifyToken, alertsController.getAlerts);
router.put('/:id', verifyToken, alertsController.updateAlert);
router.delete('/:id', verifyToken, alertsController.deleteAlert);

// Check and trigger alerts
router.post('/check-alerts', verifyToken, alertsController.checkAndTriggerAlerts);

// Notifications
router.get('/notifications', verifyToken, alertsController.getNotifications);
router.put('/notifications/:id/read', verifyToken, alertsController.markNotificationAsRead);

module.exports = router;
