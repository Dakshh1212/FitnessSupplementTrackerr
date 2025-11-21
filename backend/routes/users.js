// backend/routes/users.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { getAllUsers, getUserProfile } = require('../controllers/userController');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (for testing you can remove `protect` for now)
router.get('/', protect, getAllUsers);

// @desc    Get logged-in user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

module.exports = router;
