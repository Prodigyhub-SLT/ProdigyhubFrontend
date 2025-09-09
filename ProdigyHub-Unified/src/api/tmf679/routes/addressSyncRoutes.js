const express = require('express');
const router = express.Router();
const addressSyncController = require('../controllers/addressSyncController');

// Address sync routes
router.post('/sync-addresses', addressSyncController.syncAddresses);
router.get('/sync-addresses/status', addressSyncController.getSyncStatus);
router.post('/sync-addresses/user/:userId', addressSyncController.syncAddressToUser);

module.exports = router;
