// userController.js - Controller for User Management API
const { User } = require('../../../models/AllTMFModels');
const bcrypt = require('bcryptjs');

const userController = {
  // POST /api/users - Create new user
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      
      // Validate required fields for basic signup
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.phoneNumber || !userData.nic || !userData.password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'First name, last name, email, phone number, NIC, and password are required fields'
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

      // Hash password for security
      const saltRounds = 12; // Higher number = more secure but slower
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      console.log('🔐 Password hashed successfully for user:', userData.email);
      
      // Create new user with basic info
      const newUser = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        nic: userData.nic, // ✅ Added NIC field
        password: hashedPassword, // ✅ Now stored as hashed password
        userId: userData.userId || null, // Firebase UID if available
        userEmail: userData.email,
        status: 'active', // Start as active (no email verification required)
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedUser = await newUser.save();
      
      // Firebase automatically sent verification email
      console.log('📧 Firebase verification email sent automatically to:', userData.email);
      
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

  // PUT /api/users/email/:email - Update user by email
  updateUserByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const updateData = req.body;
      
      // Remove immutable fields
      delete updateData.id;
      delete updateData.email;
      delete updateData.createdAt;
      
      updateData.updatedAt = new Date();

      const updatedUser = await User.findOneAndUpdate(
        { email },
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
      console.error('Error in updateUserByEmail:', error);
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
  },

  // POST /api/users/login - User login with password verification
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid email or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return user data (without password)
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse._id;
      delete userResponse.__v;

      res.status(200).json({
        message: 'Login successful',
        user: userResponse
      });
    } catch (error) {
      console.error('Error in loginUser:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // POST /api/users/verify-password - Verify password for existing user
  verifyPassword: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      res.status(200).json({
        message: 'Password verification completed',
        isValid: isPasswordValid
      });
    } catch (error) {
      console.error('Error in verifyPassword:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/users/verify-email/:token - Verify email with token
  verifyEmail: async (req, res) => {
    res.status(200).json({
      message: 'Email verification endpoint',
      note: 'This endpoint is available but email verification is not currently implemented.',
      instructions: 'Users can sign up and login without email verification for now.'
    });
  },

  // POST /api/users/resend-verification - Resend verification email
  resendVerification: async (req, res) => {
    res.status(200).json({
      message: 'Resend verification endpoint',
      note: 'Email verification is not currently implemented.',
      instructions: 'Users can sign up and login without email verification for now.'
    });
  },

  // POST /api/users/hash-existing-passwords - Hash all existing plain text passwords (one-time use)
  hashExistingPasswords: async (req, res) => {
    try {
      console.log('🔐 Starting to hash existing plain text passwords...');
      
      // Find all users with passwords that don't look like bcrypt hashes
      // Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
      const usersWithPlainPasswords = await User.find({
        password: { 
          $not: /^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/ 
        }
      });

      console.log(`📊 Found ${usersWithPlainPasswords.length} users with plain text passwords`);

      let hashedCount = 0;
      for (const user of usersWithPlainPasswords) {
        try {
          // Hash the plain text password
          const saltRounds = 12;
          const hashedPassword = await bcrypt.hash(user.password, saltRounds);
          
          // Update user with hashed password
          user.password = hashedPassword;
          await user.save();
          
          hashedCount++;
          console.log(`✅ Hashed password for user: ${user.email}`);
        } catch (hashError) {
          console.error(`❌ Failed to hash password for user ${user.email}:`, hashError.message);
        }
      }

      res.status(200).json({
        message: 'Password hashing completed',
        totalUsers: usersWithPlainPasswords.length,
        hashedCount: hashedCount,
        remainingCount: usersWithPlainPasswords.length - hashedCount
      });
    } catch (error) {
      console.error('Error in hashExistingPasswords:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/users/profile/:userId - Get user profile by Firebase UID
  getUserProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'User ID is required'
        });
      }

      // Find user by Firebase UID
      const user = await User.findOne({ userId });
      
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      // Return user profile data (excluding sensitive information)
      const profileData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        nic: user.nic,
        address: user.address,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(200).json(profileData);
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // PUT /api/users/update - Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const { userId, updates } = req.body;
      
      console.log('🔄 Received user update request:', { userId, updates });
      console.log('🏠 Address in update:', updates?.address);
      
      if (!userId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'User ID is required'
        });
      }

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'No updates provided'
        });
      }

      // Find user by Firebase UID
      console.log('🔍 Looking for user with userId:', userId);
      const user = await User.findOne({ userId });
      
      if (!user) {
        console.log('❌ User not found with userId:', userId);
        // Let's also try to find by email or other fields for debugging
        const userByEmail = await User.findOne({ email: updates.email });
        console.log('🔍 User found by email:', userByEmail ? userByEmail.userId : 'None');
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }
      
      console.log('✅ User found:', { id: user._id, userId: user.userId, email: user.email });

      // Update allowed fields
      const allowedUpdates = ['firstName', 'lastName', 'email', 'phoneNumber', 'nic', 'address'];
      const updateData = {};
      
      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      }

      // Add updated timestamp
      updateData.updatedAt = new Date();

      console.log('🔄 Updating user with data:', updateData);
      console.log('🏠 Address being saved:', updateData.address);

      // Update user
      const updatedUser = await User.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(500).json({
          error: 'Update Failed',
          message: 'Failed to update user'
        });
      }

      console.log('✅ User updated successfully:', {
        id: updatedUser._id,
        email: updatedUser.email,
        address: updatedUser.address
      });

      // Return updated user data (excluding sensitive information)
      const responseData = {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        nic: updatedUser.nic,
        address: updatedUser.address,
        status: updatedUser.status,
        updatedAt: updatedUser.updatedAt
      };

      res.status(200).json({
        message: 'User profile updated successfully',
        user: responseData
      });
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
};

module.exports = userController;
