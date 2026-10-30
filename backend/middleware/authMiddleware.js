
const jwt = require("jsonwebtoken");
const db = require("../config/mysql");

/**
 * Remove sensitive fields before attaching a database user
 * to the request. Preserve other fields for compatibility
 * with existing routes.
 */
function sanitizeUser(user) {
  const safeUser = { ...user };

  const sensitiveFields = [
    "password",
    "password_hash",
    "passwordHash",
    "reset_token",
    "resetToken",
    "refresh_token",
    "refreshToken",
  ];

  for (const field of Object.keys(safeUser)) {
    if (
      sensitiveFields.some(
        (sensitiveField) =>
          field.toLowerCase() === sensitiveField.toLowerCase()
      )
    ) {
      delete safeUser[field];
    }
  }

  return safeUser;
}

/* =======================
   PROTECT MIDDLEWARE
======================= */
const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;

  // Require the standard Bearer token format.
  if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
    return res.status(401).json({
      success: false,
      message: "Authentication token required.",
    });
  }

  // Fail safely if the JWT secret is not configured.
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("Authentication configuration error: JWT_SECRET is missing.");

    return res.status(500).json({
      success: false,
      message: "Authentication service is not configured.",
    });
  }

  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  let decoded;

  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  // Require a valid user ID in the verified token.
  if (
    !decoded ||
    typeof decoded !== "object" ||
    !Number.isSafeInteger(Number(decoded.id)) ||
    Number(decoded.id) <= 0
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [Number(decoded.id)]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User account not found. Please log in again.",
      });
    }

    // Keep the existing req.user.id and other non-sensitive fields.
    req.user = sanitizeUser(users[0]);

    return next();
  } catch (error) {
    // Keep database details in server logs, not API responses.
    console.error("AUTHENTICATION DATABASE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify your account right now.",
    });
  }
};

module.exports = {
  protect,
};
