// userController.js - Controller for User Management API
const { User } = require('../../../models/AllTMFModels');

const userController = {
  // POST /api/users - Create new user
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      
      // Validate required fields for basic signup
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.phoneNumber || !userData.password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'First name, last name, email, phone number, and password are required fields'
        });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Please provide a valid email address'
        });
      }

      // Password strength validation (minimum 6 characters)
      if (userData.password.length < 6) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists with the same email
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists'
        });
      }

      // Create new user with basic info
      const newUser = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password, // In production, this should be hashed
        userId: userData.userId || null, // Firebase UID if available
        userEmail: userData.email,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedUser = await newUser.save();
      
      // Remove sensitive data from response
      const response = savedUser.toObject();
      delete response._id;
      delete response.password; // Don't send password back
      delete response.__v;

      res.status(201).json({
        message: 'User created successfully',
        user: response
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/users - List all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}).select('-__v');
      res.status(200).json(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/users/:id - Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findOne({ id }).select('-__v');
      
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/users/email/:email - Get user by email
  getUserByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const user = await User.findOne({ email }).select('-__v');
      
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // PUT /api/users/:id - Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Remove immutable fields
      delete updateData.id;
      delete updateData.createdAt;
      
      updateData.updatedAt = new Date();

      const updatedUser = await User.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      ).select('-__v');

      if (!updatedUser) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // DELETE /api/users/:id - Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await User.findOneAndDelete({ id });
      
      if (!deletedUser) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      res.status(200).json({
        message: 'User deleted successfully',
        deletedUser: deletedUser.id
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/users/district/:district - Get users by district
  getUsersByDistrict: async (req, res) => {
    try {
      const { district } = req.params;
      const users = await User.find({ 
        'address.district': district,
        status: 'active'
      }).select('-__v');
      
      res.status(200).json(users);
    } catch (error) {
      console.error('Error in getUsersByDistrict:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/users/province/:province - Get users by province
  getUsersByProvince: async (req, res) => {
    try {
      const { province } = req.params;
      const users = await User.find({ 
        'address.province': province,
        status: 'active'
      }).select('-__v');
      
      res.status(200).json(users);
    } catch (error) {
      console.error('Error in getUsersByProvince:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/users/stats - Get user statistics
  getUserStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: 'active' });
      const pendingUsers = await User.countDocuments({ status: 'pending' });
      
      // Get users by province
      const usersByProvince = await User.aggregate([
        { $group: { _id: '$address.province', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get users by district
      const usersByDistrict = await User.aggregate([
        { $group: { _id: '$address.district', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.status(200).json({
        totalUsers,
        activeUsers,
        pendingUsers,
        usersByProvince,
        usersByDistrict
      });
    } catch (error) {
      console.error('Error in getUserStats:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
};

module.exports = userController;
