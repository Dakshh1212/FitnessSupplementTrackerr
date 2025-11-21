// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Helper: Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Register User
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });

    // Create user. Do NOT double-hash here if your model uses a pre-save hook.
    // If your model doesn't hash, uncomment the next two lines to hash here:
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    // and pass password: hashedPassword to create().
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password // rely on model pre-save to hash; if not, see comment above
    });

    // If created user might not include computed fields until saved, ensure user is fresh:
    // const freshUser = await User.findById(user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    // if duplicate key or validation error, give informative message
    const msg = err.code === 11000 ? 'Email already registered' : 'Server Error';
    res.status(500).json({ success: false, message: msg });
  }
};

// Login User
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // ensure password field is selected
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or password' });

    // Prefer model method if available
    let isMatch = false;
    if (typeof user.matchPassword === 'function') {
      try {
        isMatch = await user.matchPassword(password);
      } catch (e) {
        // fallback to bcrypt
        isMatch = await bcrypt.compare(password, user.password);
      }
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid email or password' });

    // update last login (optional)
    try {
      user.lastLogin = Date.now();
      // save but don't trigger validations that might fail on partial data
      await user.save();
    } catch (saveErr) {
      console.error('Failed to update lastLogin:', saveErr);
      // non-fatal; continue
    }

    const token = generateToken(user._id);

    // hide password before responding
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('REGISTER ERROR DETAILS:', err);
    res.status(500).json({ message: err.message, stack: err.stack });

  }
};

// Get Logged In User
exports.getMe = async (req, res) => {
  try {
    // protect middleware should set req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('GETME ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update Profile (keeps existing behavior)
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('UPDATE PROFILE ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Complete Onboarding
exports.completeOnboarding = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.gender = req.body.gender;
    user.age = req.body.age;
    user.height = req.body.height;
    user.weight = req.body.weight;
    user.fitnessGoals = req.body.fitnessGoals || user.fitnessGoals;
    user.activityLevel = req.body.activityLevel || user.activityLevel;
    user.isOnboardingComplete = true;
    user.onboardingCompletedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user
    });
  } catch (err) {
    console.error('ONBOARDING ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });

  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = (typeof user.matchPassword === 'function')
      ? await user.matchPassword(currentPassword)
      : await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get User Stats (kept simple)
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'User stats retrieved',
      stats: {
        workoutsCompleted: user.workoutsCompleted || 0,
        caloriesBurned: user.caloriesBurned || 0
      }
    });
  } catch (err) {
    console.error('GET STATS ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = (typeof user.matchPassword === 'function')
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password' });

    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('DELETE ACCOUNT ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
