
const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

const ALLOWED_GOALS = [
  "fat_loss",
  "muscle_gain",
  "maintenance",
];

const ALLOWED_ACTIVITY_LEVELS = [
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
];

router.post("/", protect, async (req, res) => {
  try {
    const {
      age,
      weight,
      height,
      gender,
      activityLevel,
      goal,
    } = req.body;

    const parsedAge = Number(age);
    const parsedWeight = Number(weight);
    const parsedHeight = Number(height);

    if (
      age === undefined ||
      age === null ||
      age === "" ||
      weight === undefined ||
      weight === null ||
      weight === "" ||
      height === undefined ||
      height === null ||
      height === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Age, weight, and height are required.",
      });
    }

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 13 ||
      parsedAge > 120 ||
      !Number.isFinite(parsedWeight) ||
      parsedWeight < 20 ||
      parsedWeight > 500 ||
      !Number.isFinite(parsedHeight) ||
      parsedHeight < 50 ||
      parsedHeight > 260
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid age, weight, and height values.",
      });
    }

    const normalizedGender = String(gender || "male")
      .trim()
      .toLowerCase();

    if (!["male", "female", "other"].includes(normalizedGender)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid gender.",
      });
    }

    const normalizedActivity = String(
      activityLevel || "moderately_active"
    )
      .trim()
      .toLowerCase();

    const normalizedGoal = String(goal || "maintenance")
      .trim()
      .toLowerCase();

    if (!ALLOWED_ACTIVITY_LEVELS.includes(normalizedActivity)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid activity level.",
      });
    }

    if (!ALLOWED_GOALS.includes(normalizedGoal)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid fitness goal.",
      });
    }

    const [result] = await db.promise().query(
      `UPDATE users
       SET age = ?,
           weight = ?,
           height = ?,
           gender = ?,
           activityLevel = ?,
           goal = ?,
           isOnboardingComplete = 1
       WHERE id = ?`,
      [
        parsedAge,
        parsedWeight,
        parsedHeight,
        normalizedGender,
        normalizedActivity,
        normalizedGoal,
        req.user.id,
      ]
    );

    if (result.affectedRows === 0) {
      const [users] = await db.promise().query(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
    }

    return res.json({
      success: true,
      message: "Onboarding completed successfully.",
      updated: result.affectedRows,
    });
  } catch (error) {
    console.error("ONBOARDING ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete onboarding.",
    });
  }
});

module.exports = router;
