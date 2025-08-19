// userRoutes.js - Routes for User Management API
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Test endpoint to verify the API is working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'User API is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// User CRUD operations
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// User search operations
router.get('/email/:email', userController.getUserByEmail);
router.get('/district/:district', userController.getUsersByDistrict);
router.get('/province/:province', userController.getUsersByProvince);

module.exports = router;
