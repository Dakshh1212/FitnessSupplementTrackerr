
const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

function localDateKey(value) {
  if (!value) return null;

  // Preserve MySQL DATE strings without timezone conversion.
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateStreak(records = []) {
  if (!Array.isArray(records) || records.length === 0) return 0;

  const activeDays = new Set();

  records.forEach((record) => {
    const key = localDateKey(record.created_at);
    if (key) activeDays.add(key);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = localDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const current = activeDays.has(todayKey) ? today : yesterday;

  let streak = 0;
  const date = new Date(current);

  while (activeDays.has(localDateKey(date))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function getDateKeyFromParts(value) {
  return localDateKey(value);
}

router.get("/", protect, async (req, res) => {
  const userId = req.user.id;

  try {
    const [
      workoutResults,
      dietResults,
      weeklyWorkoutResults,
      weeklyDietResults,
    ] = await Promise.all([
      query(
        `SELECT id, created_at, totalCaloriesBurned
         FROM workout_sessions
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
      ),

      query(
        `SELECT id, created_at, calories AS totalCalories
         FROM diet_entries
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
      ),

      query(
        `SELECT
           DATE(created_at) AS activityDate,
           COUNT(*) AS workoutCount,
           COALESCE(SUM(totalCaloriesBurned), 0) AS caloriesBurned
         FROM workout_sessions
         WHERE user_id = ?
           AND created_at >= DATE_SUB(
             CURRENT_DATE,
             INTERVAL WEEKDAY(CURRENT_DATE) DAY
           )
           AND created_at < DATE_ADD(
             DATE_SUB(
               CURRENT_DATE,
               INTERVAL WEEKDAY(CURRENT_DATE) DAY
             ),
             INTERVAL 7 DAY
           )
         GROUP BY DATE(created_at)`,
        [userId]
      ),

      query(
        `SELECT
           DATE(created_at) AS activityDate,
           COALESCE(SUM(calories), 0) AS caloriesConsumed
         FROM diet_entries
         WHERE user_id = ?
           AND created_at >= DATE_SUB(
             CURRENT_DATE,
             INTERVAL WEEKDAY(CURRENT_DATE) DAY
           )
           AND created_at < DATE_ADD(
             DATE_SUB(
               CURRENT_DATE,
               INTERVAL WEEKDAY(CURRENT_DATE) DAY
             ),
             INTERVAL 7 DAY
           )
         GROUP BY DATE(created_at)`,
        [userId]
      ),
    ]);

    const workouts = Array.isArray(workoutResults)
      ? workoutResults
      : [];

    const diets = Array.isArray(dietResults)
      ? dietResults
      : [];

    // Monday-Sunday chart data.
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyCalories = Array(7).fill(0);
    const weeklyWorkouts = Array(7).fill(0);
    const dateToIndex = new Map();

    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(
      monday.getDate() - ((monday.getDay() + 6) % 7)
    );

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      dateToIndex.set(localDateKey(date), index);
    }

    weeklyWorkoutResults.forEach((row) => {
      const index = dateToIndex.get(
        getDateKeyFromParts(row.activityDate)
      );

      if (index !== undefined) {
        weeklyWorkouts[index] = Number(row.workoutCount) || 0;
      }
    });

    weeklyDietResults.forEach((row) => {
      const index = dateToIndex.get(
        getDateKeyFromParts(row.activityDate)
      );

      if (index !== undefined) {
        weeklyCalories[index] =
          Number(row.caloriesConsumed) || 0;
      }
    });

    // Today's workout, food, and supplement totals.
    const [
      todayWorkoutResults,
      todayDietResults,
      todaySupplementResults,
      todayProteinResults,
    ] = await Promise.all([
      query(
        `SELECT
           COUNT(*) AS workoutCount,
           COALESCE(SUM(totalCaloriesBurned), 0) AS caloriesBurned
         FROM workout_sessions
         WHERE user_id = ?
           AND created_at >= CURRENT_DATE
           AND created_at < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)`,
        [userId]
      ),

      query(
        `SELECT
           COALESCE(SUM(calories), 0) AS caloriesConsumed
         FROM diet_entries
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

      // This assumes diet_entries has a protein column.
      // If it does not, the fallback below will be used.
      query(
        `SELECT COALESCE(SUM(protein), 0) AS foodProtein
         FROM diet_entries
         WHERE user_id = ?
           AND created_at >= CURRENT_DATE
           AND created_at < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)`,
        [userId]
      ).catch((error) => {
        if (error.code === "ER_BAD_FIELD_ERROR") {
          return [{ foodProtein: 0 }];
        }
        throw error;
      }),
    ]);

    const todayWorkout = todayWorkoutResults[0] || {};
    const todayDiet = todayDietResults[0] || {};
    const todaySupplement = todaySupplementResults[0] || {};
    const todayProtein = todayProteinResults[0] || {};

    const foodCalories =
      Number(todayDiet.caloriesConsumed) || 0;

    const supplementCalories =
      Number(todaySupplement.supplementCalories) || 0;

    const foodProtein =
      Number(todayProtein.foodProtein) || 0;

    const supplementProtein =
      Number(todaySupplement.supplementProtein) || 0;

    const caloriesBurned =
      Number(todayWorkout.caloriesBurned) || 0;

    const totalWorkoutCalories = workouts.reduce(
      (sum, workout) =>
        sum + (Number(workout.totalCaloriesBurned) || 0),
      0
    );

    const totalDietCalories = diets.reduce(
      (sum, diet) => sum + (Number(diet.totalCalories) || 0),
      0
    );

    return res.json({
      success: true,
      data: {
        today: {
          workouts: Number(todayWorkout.workoutCount) || 0,

          foodCalories,
          supplementCalories,
          caloriesConsumed: foodCalories + supplementCalories,
          calories: foodCalories + supplementCalories,
          caloriesBurned,

          foodProtein,
          supplementProtein,
          proteinConsumed: foodProtein + supplementProtein,

          supplementIntakeCount:
            Number(todaySupplement.supplementIntakeCount) || 0,
        },

        totals: {
          workouts: workouts.length,
          caloriesConsumed: totalDietCalories,
          caloriesBurned: totalWorkoutCalories,
        },

        weekly: {
          labels,
          calories: weeklyCalories,
          workouts: weeklyWorkouts,
        },

        streaks: {
          workoutStreak: calculateStreak(workouts),
          dietStreak: calculateStreak(diets),
        },
      },
    });
  } catch (error) {
    console.error("DASHBOARD SQL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard data.",
    });
  }
});

module.exports = router;
