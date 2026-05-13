console.log("🔥 GOAL ROUTES LOADED");

const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

/* ======================
   🎯 CALCULATE GOALS
====================== */
const calculateGoals = (user) => {

  if (!user.height || !user.weight || !user.age) {
    return null;
  }

  const bmr =
    user.gender === "female"
      ? 10 * user.weight + 6.25 * user.height - 5 * user.age - 161
      : 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;

  const activityMap = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725
  };

  const tdee = bmr * (activityMap[user.activityLevel] || 1.2);

  let intakeGoal = tdee;

  if (user.goal === "fat_loss") intakeGoal -= 400;
  if (user.goal === "muscle_gain") intakeGoal += 300;

  return {
    intakeGoal: Math.round(intakeGoal),
    burnGoal: 300,
    proteinGoal: Math.round(user.weight * 1.8)
  };
};


/* ======================
   📊 DAILY GOALS API (FIXED SAFE)
====================== */
router.get("/daily", protect, (req, res) => {

  db.query(
    "SELECT * FROM users WHERE id = ?",
    [req.user.id],
    (userErr, userResults) => {

      if (userErr || !userResults?.length) {
        return res.status(404).json({
          success: false,
          message: "User not found ❌"
        });
      }

      const user = userResults[0];
      const goals = calculateGoals(user);

      /* ======================
         ⚠️ DEFAULT USER
      ====================== */
      if (!goals) {
        return res.json({
          success: true,
          data: {
            intakeGoal: 2000,
            burnGoal: 300,
            proteinGoal: 100,

            consumed: 0,
            burned: 0,
            proteinConsumed: 0,

            intakePercent: 0,
            burnPercent: 0,

            suggestion: "Complete profile for personalized goals ⚠️"
          }
        });
      }

      /* ======================
         🍎 DIET
      ====================== */
      db.query(
        "SELECT * FROM diet_entries WHERE user_id = ?",
        [req.user.id],
        (dietErr, dietResults) => {

          /* ======================
             🏋️ WORKOUT
          ====================== */
          db.query(
            "SELECT * FROM workout_sessions WHERE user_id = ?",
            [req.user.id],
            (workoutErr, workoutResults) => {

              const diets = dietResults || [];
              const workouts = workoutResults || [];

              let consumed = 0;
              let burned = 0;
              let proteinConsumed = 0;

              diets.forEach(d => {
                consumed += d.calories || d.totalCalories || 0;
                proteinConsumed += d.protein || 0;
              });

              workouts.forEach(w => {
                burned += w.totalCaloriesBurned || 0;
              });

              const intakePercent = Math.min(
                (consumed / goals.intakeGoal) * 100,
                100
              );

              const burnPercent = Math.min(
                (burned / goals.burnGoal) * 100,
                100
              );

              /* ======================
                 🧠 SMART SUGGESTION
              ====================== */
              let suggestion = "Balanced day 👍";

              if (consumed > goals.intakeGoal + 200 && burned < 100) {
                suggestion = "High calories, low activity 🚨";
              } else if (
                consumed < goals.intakeGoal &&
                burned >= goals.burnGoal
              ) {
                suggestion = "Great fat loss day 🔥";
              } else if (burned === 0) {
                suggestion = "No workout today 😴";
              } else if (proteinConsumed < goals.proteinGoal * 0.7) {
                suggestion = "Increase protein ⚠️";
              }

              return res.json({
                success: true,
                data: {
                  ...goals,

                  consumed,
                  burned,
                  proteinConsumed,

                  intakePercent,
                  burnPercent,

                  suggestion
                }
              });

            }
          );
        }
      );
    }
  );
});

module.exports = router;