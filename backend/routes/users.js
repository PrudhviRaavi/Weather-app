const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Placeholder routes
router.get('/', verifyToken, (req, res) => {
  res.json({ message: 'Get user profile' });
});

router.put('/', verifyToken, (req, res) => {
  res.json({ message: 'Update user profile' });
});

module.exports = router;
