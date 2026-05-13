const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

/* ======================
   🚀 ONBOARDING (FIXED)
====================== */
router.post("/", protect, (req, res) => {

  const {
    age,
    weight,
    height,
    gender,
    activityLevel,
    goal
  } = req.body;

  // 🔥 STRICT VALIDATION
  if (!age || !weight || !height) {
    return res.status(400).json({
      success: false,
      message: "age, weight, height required ❌"
    });
  }

  const sql = `
    UPDATE users
    SET
      age = ?,
      weight = ?,
      height = ?,
      gender = ?,
      activityLevel = ?,
      goal = ?,
      isOnboardingComplete = 1
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      Number(age),
      Number(weight),
      Number(height),
      gender || "male",
      activityLevel || "moderately_active",
      goal || "maintenance",
      req.user.id
    ],
    (err, result) => {

      if (err) {
        console.log("ONBOARDING ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Server Error ❌"
        });
      }

      return res.json({
        success: true,
        message: "Onboarding completed ✅",
        updated: result.affectedRows
      });

    }
  );

});

module.exports = router;