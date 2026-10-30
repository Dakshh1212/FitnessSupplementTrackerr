
const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

const DEFAULT_GOALS = {
  intakeGoal: 2000,
  burnGoal: 300,
  proteinGoal: 100,
};

const roundTo = (value, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const toNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

function query(sql, params = []) {
  return db.promise().query(sql, params).then(([rows]) => rows);
}

function calculateGoals(user) {
  const height = Number(user.height);
  const weight = Number(user.weight);
  const age = Number(user.age);

  if (
    !Number.isFinite(height) ||
    !Number.isFinite(weight) ||
    !Number.isFinite(age) ||
    height <= 0 ||
    weight <= 0 ||
    age <= 0
  ) {
    return null;
  }

  const gender = String(user.gender || "").trim().toLowerCase();

  const bmr =
    10 * weight +
    6.25 * height -
    5 * age +
    (gender === "female" ? -161 : 5);

  const activityMap = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  const activityLevel = String(user.activityLevel || "")
    .trim()
    .toLowerCase();

  const tdee = bmr * (activityMap[activityLevel] || 1.2);
  const goalType = String(user.goal || "").trim().toLowerCase();

  let intakeGoal = tdee;

  if (goalType === "fat_loss") intakeGoal -= 400;
  if (goalType === "muscle_gain") intakeGoal += 300;

  return {
    intakeGoal: Math.max(0, Math.round(intakeGoal)),
    burnGoal: DEFAULT_GOALS.burnGoal,
    proteinGoal: Math.round(weight * 1.8),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

function getBmiDetails(user) {
  const heightCm = Number(user.height);
  const weightKg = Number(user.weight);
  const age = Number(user.age);

  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    heightCm <= 0 ||
    weightKg <= 0
  ) {
    return { bmi: null, bmiCategory: null };
  }

  const bmi = roundTo(weightKg / ((heightCm / 100) ** 2), 1);

  if (!Number.isFinite(age) || age < 20) {
    return { bmi, bmiCategory: "Adult category not applicable" };
  }

  let bmiCategory = "Healthy weight range";

  if (bmi < 18.5) bmiCategory = "Below healthy weight range";
  else if (bmi < 25) bmiCategory = "Healthy weight range";
  else if (bmi < 30) bmiCategory = "Above healthy weight range";
  else bmiCategory = "High BMI range";

  return { bmi, bmiCategory };
}

function getSuggestion({ consumed, burned, proteinConsumed, goals }) {
  if (consumed === 0 && burned === 0 && proteinConsumed === 0) {
    return "Start logging today's meals and workouts to track your progress.";
  }

  if (consumed > goals.intakeGoal + 200 && burned < 100) {
    return "Your logged calorie intake is above today's target. Review your meals and activity.";
  }

  if (proteinConsumed < goals.proteinGoal * 0.7) {
    return "Your logged protein is below 70% of today's target. Consider a protein-rich meal and review your intake.";
  }

  if (burned === 0) {
    return "No workout has been logged today. Follow an activity plan appropriate for your fitness level.";
  }

  if (consumed < goals.intakeGoal && burned >= goals.burnGoal) {
    return "Good consistency with your logged nutrition and activity today.";
  }

  return "Keep tracking your nutrition and activity to stay consistent.";
}

router.get("/daily", protect, async (req, res) => {
  try {
    const userId = Number(req.user.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user.",
      });
    }

    const userResults = await query(
      `SELECT id, height, weight, age, gender, activityLevel, goal
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (!userResults.length) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = userResults[0];
    const calculatedGoals = calculateGoals(user);
    const goals = calculatedGoals || { ...DEFAULT_GOALS };
    const bmiDetails = getBmiDetails(user);

    const [dietResults, workoutResults, supplementResults] =
      await Promise.all([
        query(
          `SELECT
             COALESCE(SUM(COALESCE(d.calories, 0)), 0) AS foodCalories,
             COALESCE(
               SUM(
                 COALESCE(f.protein, 0) *
                 COALESCE(d.quantity, 0) / 100
               ),
               0
             ) AS foodProtein
           FROM diet_entries d
           LEFT JOIN foods f ON f.id = d.food_id
           WHERE d.user_id = ?
             AND d.created_at >= CURRENT_DATE
             AND d.created_at < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)`,
          [userId]
        ),

        query(
          `SELECT COALESCE(SUM(totalCaloriesBurned), 0) AS burned
           FROM workout_sessions
           WHERE user_id = ?
             AND created_at >= CURRENT_DATE
             AND created_at < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)`,
          [userId]
        ),

        query(
          `SELECT
             COALESCE(
               SUM(COALESCE(si.servings, 1) *
                   COALESCE(s.caloriesPerServing, 0)),
               0
             ) AS supplementCalories,
             COALESCE(
               SUM(COALESCE(si.servings, 1) *
                   COALESCE(s.proteinPerServing, 0)),
               0
             ) AS supplementProtein,
             COUNT(si.id) AS supplementIntakeCount
           FROM supplement_intake si
           INNER JOIN supplements s ON s.id = si.supplement_id
           WHERE si.user_id = ?
             AND si.created_at >= CURRENT_DATE
             AND si.created_at < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)`,
          [userId]
        ),
      ]);

    const diet = dietResults[0] || {};
    const workout = workoutResults[0] || {};
    const supplements = supplementResults[0] || {};

    const foodCalories = toNonNegativeNumber(diet.foodCalories);
    const foodProtein = toNonNegativeNumber(diet.foodProtein);
    const supplementCalories = toNonNegativeNumber(
      supplements.supplementCalories
    );
    const supplementProtein = toNonNegativeNumber(
      supplements.supplementProtein
    );

    // Daily totals include food and supplements actually consumed.
    const consumed = foodCalories + supplementCalories;
    const proteinConsumed = foodProtein + supplementProtein;
    const burned = toNonNegativeNumber(workout.burned);

    const intakePercent =
      goals.intakeGoal > 0
        ? Math.min(100, (consumed / goals.intakeGoal) * 100)
        : 0;

    const burnPercent =
      goals.burnGoal > 0
        ? Math.min(100, (burned / goals.burnGoal) * 100)
        : 0;

    return res.json({
      success: true,
      data: {
        ...goals,
        ...bmiDetails,

        weight: Number(user.weight) || null,
        height: Number(user.height) || null,
        age: Number(user.age) || null,
        gender: user.gender || null,
        activityLevel: user.activityLevel || null,
        goal: user.goal || null,

        // Combined daily totals: food + consumed supplements.
        consumed: roundTo(consumed),
        burned: roundTo(burned),
        proteinConsumed: roundTo(proteinConsumed),
        proteinRemaining: roundTo(
          Math.max(0, goals.proteinGoal - proteinConsumed)
        ),

        // Breakdown for the frontend.
        foodCalories: roundTo(foodCalories),
        supplementCalories: roundTo(supplementCalories),
        foodProtein: roundTo(foodProtein),
        supplementProtein: roundTo(supplementProtein),
        supplementIntakeCount: Number(supplements.supplementIntakeCount || 0),

        caloriesRemaining: roundTo(
          Math.max(0, goals.intakeGoal - consumed)
        ),

        intakePercent: roundTo(intakePercent),
        burnPercent: roundTo(burnPercent),

        suggestion: calculatedGoals
          ? getSuggestion({ consumed, burned, proteinConsumed, goals })
          : "Complete your profile with your body details to calculate personalized goals.",

        profileComplete: Boolean(calculatedGoals),
      },
    });
  } catch (error) {
    console.error("DAILY GOALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate daily goals.",
    });
  }
});

module.exports = router;
