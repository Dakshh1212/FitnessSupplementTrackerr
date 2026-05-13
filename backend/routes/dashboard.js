const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

/* ======================
   📊 DASHBOARD API (FIXED)
====================== */
router.get("/", protect, (req, res) => {

  const userId = req.user.id;

  db.query(
    `SELECT * FROM workout_sessions WHERE user_id = ?`,
    [userId],
    (workoutErr, workoutResults) => {

      if (workoutErr) {
        return res.status(500).json({
          success: false,
          message: "Workout error ❌"
        });
      }

      db.query(
        `SELECT * FROM diet_entries WHERE user_id = ?`,
        [userId],
        (dietErr, dietResults) => {

          if (dietErr) {
            return res.status(500).json({
              success: false,
              message: "Diet error ❌"
            });
          }

          let totalWorkoutCalories = 0;
          let totalDietCalories = 0;

          const workouts = workoutResults || [];
          const diets = dietResults || [];

          // ================= TOTAL CALC =================
          workouts.forEach(w => {
            totalWorkoutCalories += w.totalCaloriesBurned || 0;
          });

          diets.forEach(d => {
            totalDietCalories += d.totalCalories || 0;
          });

          // ================= WEEK DATA =================
          const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

          const weeklyCalories = Array(7).fill(0);
          const weeklyWorkouts = Array(7).fill(0);

          workouts.forEach(w => {

            const dateField = w.created_at || w.date;

            if (!dateField) return;

            const day = new Date(dateField).getDay();

            weeklyWorkouts[day] += 1;
            weeklyCalories[day] += w.totalCaloriesBurned || 0;
          });

          diets.forEach(d => {

            const dateField = d.created_at || d.date;

            if (!dateField) return;

            const day = new Date(dateField).getDay();

            weeklyCalories[day] += d.totalCalories || 0;
          });

          // ================= RESPONSE =================
          return res.json({
            success: true,
            data: {
              today: {
                workouts: workouts.length,
                calories: totalWorkoutCalories + totalDietCalories
              },

              weekly: {
                labels,
                calories: weeklyCalories,
                workouts: weeklyWorkouts
              }
            }
          });

        }
      );

    }
  );
});

module.exports = router;