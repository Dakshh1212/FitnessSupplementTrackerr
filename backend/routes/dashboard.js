const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

/* =========================
   🔥 STREAK CALCULATOR
========================= */
const calculateStreak = (data = []) => {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  const dates = data
    .map((item) => {
      if (!item.created_at) return null;

      const date = new Date(item.created_at);

      if (isNaN(date.getTime())) return null;

      date.setHours(0, 0, 0, 0);

      return date.getTime();
    })
    .filter((date) => date !== null);

  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

  let streak = 0;

  const current = new Date();
  current.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === current.getTime()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/* =========================
   📊 DASHBOARD API
========================= */
router.get("/", protect, (req, res) => {
  const userId = req.user.id;

  /* =========================
     🏋️ FETCH WORKOUTS
  ========================= */
  db.query(
    `
    SELECT
      id,
      created_at,
      totalCaloriesBurned
    FROM workout_sessions
    WHERE user_id = ?
    `,
    [userId],
    (workoutErr, workoutResults) => {
      if (workoutErr) {
        console.error("WORKOUT SQL ERROR:", workoutErr);

        return res.status(500).json({
          success: false,
          message: "Workout error ❌",
          error: workoutErr.message,
        });
      }

      /* =========================
         🍽️ FETCH DIET
      ========================= */
      db.query(
        `
        SELECT
          id,
          created_at,
          calories AS totalCalories
        FROM diet_entries
        WHERE user_id = ?
        `,
        [userId],
        (dietErr, dietResults) => {
          if (dietErr) {
            console.error("DIET SQL ERROR:", dietErr);

            return res.status(500).json({
              success: false,
              message: "Diet error ❌",
              error: dietErr.message,
            });
          }

          const workouts = Array.isArray(workoutResults)
            ? workoutResults
            : [];

          const diets = Array.isArray(dietResults)
            ? dietResults
            : [];

          /* =========================
             🔥 TOTAL CALORIES
          ========================= */
          let totalWorkoutCalories = 0;
          let totalDietCalories = 0;

          workouts.forEach((workout) => {
            totalWorkoutCalories +=
              Number(workout.totalCaloriesBurned) || 0;
          });

          diets.forEach((diet) => {
            totalDietCalories += Number(diet.totalCalories) || 0;
          });

          /* =========================
             📅 WEEKLY DATA
          ========================= */
          const labels = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ];

          const weeklyCalories = Array(7).fill(0);
          const weeklyWorkouts = Array(7).fill(0);

          /* =========================
             🏋️ WEEKLY WORKOUTS
          ========================= */
          workouts.forEach((workout) => {
            if (!workout.created_at) return;

            const date = new Date(workout.created_at);

            if (isNaN(date.getTime())) return;

            const day = date.getDay();

            weeklyWorkouts[day] += 1;

            weeklyCalories[day] +=
              Number(workout.totalCaloriesBurned) || 0;
          });

          /* =========================
             🍽️ WEEKLY DIET
          ========================= */
          diets.forEach((diet) => {
            if (!diet.created_at) return;

            const date = new Date(diet.created_at);

            if (isNaN(date.getTime())) return;

            const day = date.getDay();

            weeklyCalories[day] +=
              Number(diet.totalCalories) || 0;
          });

          /* =========================
             🔥 STREAKS
          ========================= */
          const workoutStreak = calculateStreak(workouts);
          const dietStreak = calculateStreak(diets);

          /* =========================
             📤 RESPONSE
          ========================= */
          return res.json({
            success: true,

            data: {
              today: {
                workouts: workouts.length,
                calories:
                  totalWorkoutCalories + totalDietCalories,
              },

              weekly: {
                labels,
                calories: weeklyCalories,
                workouts: weeklyWorkouts,
              },

              streaks: {
                workoutStreak,
                dietStreak,
              },
            },
          });
        }
      );
    }
  );
});

module.exports = router;