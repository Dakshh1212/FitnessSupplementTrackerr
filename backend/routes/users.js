
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserProfile,
} = require("../controllers/userController");

/* =======================
   ADMIN AUTHORIZATION
======================= */

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const isAdminRole =
    typeof req.user.role === "string" &&
    req.user.role.toLowerCase() === "admin";

  // Temporary compatibility option for existing email-based admin access.
  const adminEmails = getAdminEmails();
  const isConfiguredAdminEmail =
    typeof req.user.email === "string" &&
    adminEmails.includes(req.user.email.trim().toLowerCase());

  if (!isAdminRole && !isConfiguredAdminEmail) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource.",
    });
  }

  return next();
};

/* =======================
   GET CURRENT USER
======================= */
router.get("/me", protect, getUserProfile);

/* =======================
   GET ALL USERS — ADMIN ONLY
======================= */
router.get("/", protect, adminOnly, getAllUsers);

module.exports = router;
