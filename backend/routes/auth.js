const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  completeOnboarding,
  changePassword,
  logout,
  deleteAccount,
  getUserStats
} = require('../controllers/authController');

const router = express.Router();

// =======================
// Register
// =======================
router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  register
);

// =======================
// Login
// =======================
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  login
);

// =======================
// Get current user
// =======================
router.get('/me', protect, getMe);

// =======================
// Update Profile
// =======================
router.put(
  '/profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('age')
      .optional()
      .isInt({ min: 13, max: 120 })
      .withMessage('Age must be between 13 and 120'),
    body('height')
      .optional()
      .isFloat({ min: 100, max: 250 })
      .withMessage('Height must be between 100 and 250 cm'),
    body('weight')
      .optional()
      .isFloat({ min: 30, max: 300 })
      .withMessage('Weight must be between 30 and 300 kg'),
  ],
  updateProfile
);

// =======================
// Onboarding
// =======================
router.post(
  '/onboarding',
  protect,
  [
    body('gender')
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be male, female, or other'),
    body('age')
      .isInt({ min: 13, max: 120 })
      .withMessage('Age must be between 13 and 120'),
    body('height')
      .isFloat({ min: 100, max: 250 })
      .withMessage('Height must be between 100 and 250 cm'),
    body('weight')
      .isFloat({ min: 30, max: 300 })
      .withMessage('Weight must be between 30 and 300 kg'),
    body('fitnessGoals')
      .isArray({ min: 1 })
      .withMessage('At least one fitness goal must be selected'),
    body('activityLevel')
      .isIn([
        'sedentary',
        'lightly_active',
        'moderately_active',
        'very_active',
        'extremely_active',
      ])
      .withMessage('Invalid activity level'),
  ],
  completeOnboarding
);

// =======================
// Change Password
// =======================
router.put(
  '/password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  changePassword
);

// =======================
// User Stats
// =======================
router.get('/stats', protect, getUserStats);

// =======================
// Delete Account
// =======================
router.delete(
  '/account',
  protect,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required to delete account'),
  ],
  deleteAccount
);

// =======================
// Logout
// =======================
router.post('/logout', protect, logout);

module.exports = router;
