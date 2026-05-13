// backend/controllers/userController.js

const User = require('../models/User');

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// ✅ Get logged-in user profile
exports.getUserProfile = async (req, res) => {
  try {
    // req.user comes from auth middleware (JWT)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};