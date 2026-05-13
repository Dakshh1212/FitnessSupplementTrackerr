const adminOnly = (req, res, next) => {
  const ADMIN_EMAIL = "thakraldaksh5040@gmail.com";

  if (!req.user || req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      message: "Admin access denied ❌"
    });
  }

  next();
};

module.exports = { adminOnly };