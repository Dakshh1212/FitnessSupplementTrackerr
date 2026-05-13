const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserProfile
} = require("../controllers/userController");

/* =======================
   👤 GET CURRENT USER
======================= */
router.get("/me", protect, getUserProfile);


/* =======================
   🔐 ADMIN MIDDLEWARE (SAFE)
======================= */
const adminOnly = (req, res, next) => {

  try {

    const ADMIN_EMAIL = "thakraldaksh5040@gmail.com";

    if (!req.user?.email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized ❌"
      });
    }

    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "Access denied ❌"
      });
    }

    next();

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }

};


/* =======================
   👥 GET ALL USERS (ADMIN ONLY)
======================= */
router.get("/", protect, adminOnly, getAllUsers);

module.exports = router;