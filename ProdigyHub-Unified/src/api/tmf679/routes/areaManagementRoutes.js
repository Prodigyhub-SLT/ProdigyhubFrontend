// areaManagementRoutes.js - Express routes for Area Management API
const express = require('express');
const router = express.Router();
const areaManagementController = require('../controllers/areaManagementController');

// Base route info
router.get('/', (req, res) => {
  res.json({
    name: 'Area Management API',
    version: '1.0.0',
    description: 'SLT Area Management Service for managing districts, provinces, and infrastructure',
    baseUrl: '/api/areaManagement/v5',
    endpoints: {
      'POST /area': 'Create new area with district, province, and infrastructure details',
      'GET /area': 'List all areas with filtering options',
      'GET /area/{id}': 'Get area by ID',
      'PUT /area/{id}': 'Update area details',
      'DELETE /area/{id}': 'Delete area',
      'GET /area/stats': 'Get area statistics and analytics'
    },
    documentation: 'https://docs.slt.lk/api/area-management',
    support: 'api-support@slt.lk',
    '@type': 'AreaManagementAPI'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Area Management API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Area CRUD operations
router.post('/area', areaManagementController.createArea);
router.get('/area', areaManagementController.listAreas);
router.get('/area/:id', areaManagementController.getAreaById);
router.put('/area/:id', areaManagementController.updateArea);
router.delete('/area/:id', areaManagementController.deleteArea);

// Area statistics
router.get('/area/stats', areaManagementController.getAreaStats);

module.exports = router;
