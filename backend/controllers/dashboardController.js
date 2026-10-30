
const db = require("../config/mysql");

function query(sql, params = []) {
  return db.promise().query(sql, params).then(([rows]) => rows);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function calculateRecommendedCalories(user) {
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
    return 2000;
  }

  const gender = String(user.gender || "").toLowerCase();

  const bmr =
    10 * weight +
    6.25 * height -
    5 * age +
    (gender === "female" ? -161 : 5);

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  const activityLevel = String(user.activityLevel || "").toLowerCase();
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  const goal = String(user.goal || "").toLowerCase();

  let calories = tdee;

  if (goal === "fat_loss") calories -= 400;
  if (goal === "muscle_gain") calories += 300;

  return Math.max(0, Math.round(calories));
}

exports.getDashboard = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user.",
      });
    }

    const [users, dietTotals, workoutTotals, supplementTotals, dietChart] =
      await Promise.all([
        query(
          `SELECT id, name, email, role, age, height, weight, gender,
                  goal, activityLevel, isOnboardingComplete
           FROM users
           WHERE id = ?
           LIMIT 1`,
          [userId]
        ),

        query(
          `SELECT
             COALESCE(SUM(calories), 0) AS totalCalories,
             COALESCE(
               SUM(
                 COALESCE(f.protein, 0) *
                 COALESCE(d.quantity, 0) / 100
               ),
               0
             ) AS totalProtein
           FROM diet_entries d
           LEFT JOIN foods f ON f.id = d.food_id
           WHERE d.user_id = ?`,
          [userId]
        ),

        query(
          `SELECT COUNT(*) AS totalWorkouts
           FROM workout_sessions
           WHERE user_id = ?`,
          [userId]
        ),

        query(
          `SELECT COUNT(*) AS totalSupplements
           FROM supplement_intakes
           WHERE user_id = ?`,
          [userId]
        ),

        query(
          `SELECT
             DATE(created_at) AS activityDate,
             COALESCE(SUM(calories), 0) AS calories
           FROM diet_entries
           WHERE user_id = ?
             AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)
             AND created_at < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)
           GROUP BY DATE(created_at)
           ORDER BY activityDate ASC`,
          [userId]
        ),
      ]);

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = users[0];
    const totals = dietTotals[0] || {};

    const consumedCalories = safeNumber(totals.totalCalories);
    const consumedProtein = safeNumber(totals.totalProtein);

    const recommendedCalories = calculateRecommendedCalories(user);
    const recommendedProtein = Number.isFinite(Number(user.weight)) &&
      Number(user.weight) > 0
      ? Math.round(Number(user.weight) * 1.6)
      : 100;

    const calorieProgress = recommendedCalories > 0
      ? Math.round((consumedCalories / recommendedCalories) * 100)
      : 0;

    const proteinProgress = recommendedProtein > 0
      ? Math.round((consumedProtein / recommendedProtein) * 100)
      : 0;

    const chartData = dietChart.map((entry) => ({
      day: new Date(entry.activityDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      calories: safeNumber(entry.calories),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalCalories: consumedCalories,
        totalProtein: Math.round(consumedProtein * 10) / 10,
        recommendedCalories,
        recommendedProtein,
        calorieProgress,
        proteinProgress,
        goal: user.goal || "maintenance",
        status:
          consumedCalories > recommendedCalories
            ? "Above Target"
            : "Within Target",
        totalWorkouts: Number(workoutTotals[0]?.totalWorkouts) || 0,
        totalSupplements: Number(supplementTotals[0]?.totalSupplements) || 0,
        chartData,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard data.",
    });
  }
};
