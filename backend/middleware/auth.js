const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =======================
// Protect Middleware
// =======================
const protect = async (req, res, next) => {
  let token;

  // Check if token is in headers (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token is in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // No token found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route (no token provided)',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found with this token',
      });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired',
    });
  }
};

// =======================
// Require Onboarding Middleware
// =======================
const requireOnboarding = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (!req.user.isOnboarded) {
    return res.status(403).json({
      success: false,
      message: 'Please complete onboarding before accessing this feature',
    });
  }

  next();
};

// =======================
// Optional: Role-based access
// =======================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, requireOnboarding, authorize };
