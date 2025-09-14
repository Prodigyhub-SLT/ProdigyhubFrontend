// userRoutes.js - Routes for User Management API
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'User API is working!',
    timestamp: new Date().toISOString()
  });
});

// User signup route (no authentication required)
router.post('/signup', userController.createUser);

// User authentication routes
router.post('/login', userController.loginUser);
router.post('/verify-password', userController.verifyPassword);

// Email verification routes
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerification);

router.post('/hash-existing-passwords', userController.hashExistingPasswords); // One-time use to hash existing passwords

// User CRUD operations
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);

// User profile routes (specific routes first)
router.get('/profile/:userId', userController.getUserProfile);
router.put('/update', userController.updateUserProfile);

// Generic CRUD operations (parameterized routes last)
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// User search operations
router.get('/email/:email', userController.getUserByEmail);
router.put('/email/:email', userController.updateUserByEmail);
router.get('/district/:district', userController.getUsersByDistrict);
router.get('/province/:province', userController.getUsersByProvince);

// Test endpoint to check MongoDB _id lookup
router.get('/test/:id', userController.testUserLookup);

module.exports = router;
