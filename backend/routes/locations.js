const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { addLocation, getLocations, deleteLocation } = require('../controllers/locationsController');

router.post('/', verifyToken, addLocation);
router.get('/', verifyToken, getLocations);
router.delete('/:id', verifyToken, deleteLocation);

module.exports = router;
