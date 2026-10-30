
const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

function isValidId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0;
}

function databaseError(res, label, error) {
  console.error(`${label}:`, error.message);

  return res.status(500).json({
    success: false,
    message: "Unable to complete this operation.",
  });
}

// All admin routes require authentication and admin privileges.
router.use(protect, adminOnly);

// GET /api/admin/users
// Return account information for the admin user-management table.
router.get("/users", async (req, res) => {
  try {
    const [users] = await db.promise().query(
      `SELECT
         id,
         name,
         email,
         role,
         isBanned,
         isOnboardingComplete,
         created_at
       FROM users
       ORDER BY id DESC`
    );

    return res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return databaseError(res, "ADMIN GET USERS ERROR", error);
  }
});

// GET /api/admin/users/:id
// Return one user's profile and their own fitness records.
router.get("/users/:id", async (req, res) => {
  const userId = req.params.id;

  if (!isValidId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  try {
    const id = Number(userId);

    const [userRows, workouts, diets, supplements] = await Promise.all([
      db.promise().query(
        `SELECT
           id, name, email, role, isBanned,
           height, weight, age, gender, goal,
           activityLevel, isOnboardingComplete,
           photo, created_at
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [id]
      ),

      db.promise().query(
        `SELECT
           id, totalDuration, totalCaloriesBurned, created_at
         FROM workout_sessions
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [id]
      ),

      db.promise().query(
        `SELECT
           id, food_id, quantity, calories, mealType, created_at
         FROM diet_entries
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [id]
      ),

      db.promise().query(
        `SELECT
           si.id,
           si.supplement_id,
           si.timing,
           si.created_at,
           s.name AS supplementName
         FROM supplement_intake AS si
         LEFT JOIN supplements AS s
           ON s.id = si.supplement_id
         WHERE si.user_id = ?
         ORDER BY si.created_at DESC`,
        [id]
      ),
    ]);

    const user = userRows[0][0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const workoutData = workouts[0];
    const dietData = diets[0];
    const supplementData = supplements[0];

    return res.json({
      success: true,
      data: {
        user,
        totalWorkouts: workoutData.length,
        totalCalories: workoutData.reduce(
          (total, workout) =>
            total + Number(workout.totalCaloriesBurned || 0),
          0
        ),
        totalDietCalories: dietData.reduce(
          (total, entry) => total + Number(entry.calories || 0),
          0
        ),
        totalSupplements: supplementData.length,
        workouts: workoutData,
        diets: dietData,
        supplements: supplementData,
      },
    });
  } catch (error) {
    return databaseError(res, "ADMIN GET USER DETAILS ERROR", error);
  }
});

// PATCH /api/admin/users/:id
// Update a user's role.
router.patch("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body || {};

  if (!isValidId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be either user or admin.",
    });
  }

  if (Number(userId) === Number(req.user.id) && role !== "admin") {
    return res.status(400).json({
      success: false,
      message: "You cannot remove your own admin role.",
    });
  }

  try {
    const [result] = await db.promise().query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, Number(userId)]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.promise().query(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [Number(userId)]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
    }

    return res.json({
      success: true,
      message: "User role updated successfully.",
    });
  } catch (error) {
    return databaseError(res, "ADMIN UPDATE ROLE ERROR", error);
  }
});

// PUT /api/admin/users/:id/ban
// Toggle a user's banned status.
router.put("/users/:id/ban", async (req, res) => {
  const userId = req.params.id;

  if (!isValidId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  if (Number(userId) === Number(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "You cannot ban your own account.",
    });
  }

  try {
    const id = Number(userId);

    const [existing] = await db.promise().query(
      "SELECT id, isBanned FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const nextStatus = Number(existing[0].isBanned) === 1 ? 0 : 1;

    await db.promise().query(
      "UPDATE users SET isBanned = ? WHERE id = ?",
      [nextStatus, id]
    );

    return res.json({
      success: true,
      message: nextStatus === 1
        ? "User banned successfully."
        : "User unbanned successfully.",
      data: {
        id,
        isBanned: nextStatus,
      },
    });
  } catch (error) {
    return databaseError(res, "ADMIN BAN USER ERROR", error);
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;

  if (!isValidId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  if (Number(userId) === Number(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "You cannot delete your own account.",
    });
  }

  try {
    const [result] = await db.promise().query(
      "DELETE FROM users WHERE id = ?",
      [Number(userId)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This user has related records. Resolve the database relationships before deleting the account.",
      });
    }

    return databaseError(res, "ADMIN DELETE USER ERROR", error);
  }
});

// GET /api/admin/stats
// Retained for compatibility with existing parts of the application.
router.get("/stats", async (req, res) => {
  try {
    const [users, workouts, diets, supplements] = await Promise.all([
      db.promise().query("SELECT COUNT(*) AS total FROM users"),
      db.promise().query("SELECT COUNT(*) AS total FROM workout_sessions"),
      db.promise().query("SELECT COUNT(*) AS total FROM diet_entries"),
      db.promise().query("SELECT COUNT(*) AS total FROM supplement_intake"),
    ]);

    return res.json({
      success: true,
      data: {
        users: Number(users[0][0].total),
        workouts: Number(workouts[0][0].total),
        diets: Number(diets[0][0].total),
        supplements: Number(supplements[0][0].total),
      },
    });
  } catch (error) {
    return databaseError(res, "ADMIN STATS ERROR", error);
  }
});

// GET /api/admin/top-users
router.get("/top-users", async (req, res) => {
  try {
    const [results] = await db.promise().query(
      `SELECT
         u.id,
         u.name,
         u.email,
         COUNT(ws.id) AS workouts,
         COALESCE(SUM(ws.totalCaloriesBurned), 0) AS calories
       FROM users AS u
       LEFT JOIN workout_sessions AS ws
         ON u.id = ws.user_id
       GROUP BY u.id, u.name, u.email
       ORDER BY workouts DESC, calories DESC
       LIMIT 5`
    );

    return res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return databaseError(res, "ADMIN TOP USERS ERROR", error);
  }
});

// GET /api/admin/chart-data
// Retained for compatibility with existing components.
router.get("/chart-data", async (req, res) => {
  try {
    const [userData, workoutData] = await Promise.all([
      db.promise().query(
        `SELECT
           DATE(created_at) AS date,
           COUNT(*) AS users
         FROM users
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      ),

      db.promise().query(
        `SELECT
           DATE(created_at) AS date,
           COUNT(*) AS workouts,
           COALESCE(SUM(totalCaloriesBurned), 0) AS calories
         FROM workout_sessions
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      ),
    ]);

    return res.json({
      success: true,
      data: {
        users: userData[0],
        workouts: workoutData[0],
      },
    });
  } catch (error) {
    return databaseError(res, "ADMIN CHART DATA ERROR", error);
  }
});

module.exports = router;
