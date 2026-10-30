
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const userRole =
    typeof req.user.role === "string"
      ? req.user.role.trim().toLowerCase()
      : "";

  const configuredEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const userEmail =
    typeof req.user.email === "string"
      ? req.user.email.trim().toLowerCase()
      : "";

  const isAdmin =
    userRole === "admin" ||
    (userEmail !== "" && configuredEmails.includes(userEmail));

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access denied.",
    });
  }

  return next();
};

module.exports = { adminOnly };
