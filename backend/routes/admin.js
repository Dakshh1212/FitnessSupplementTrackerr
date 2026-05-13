const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

console.log("🔥 ADMIN ROUTES LOADED");

/* ======================
   👥 GET ALL USERS
====================== */
router.get("/users", protect, adminOnly, (req, res) => {
  db.query(
    `SELECT id, name, email, role, isBanned, created_at FROM users`,
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Server Error ❌"
        });
      }

      res.json({
        success: true,
        count: results?.length || 0,
        data: results || []
      });
    }
  );
});

/* ======================
   👤 GET SINGLE USER
====================== */
router.get("/users/:id", protect, adminOnly, (req, res) => {
  const userId = req.params.id;

  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, users) => {
    if (err || !users?.length) {
      return res.status(404).json({
        success: false,
        message: "User not found ❌"
      });
    }

    const user = users[0];

    db.query(
      "SELECT * FROM workout_sessions WHERE user_id = ?",
      [userId],
      (workoutErr, workouts) => {

        db.query(
          "SELECT * FROM diet_entries WHERE user_id = ?",
          [userId],
          (dietErr, diets) => {

            db.query(
              "SELECT * FROM supplement_intake WHERE user_id = ?",
              [userId],
              (suppErr, supplements) => {

                const totalCalories = (workouts || []).reduce(
                  (a, b) => a + (b.totalCaloriesBurned || 0),
                  0
                );

                const totalDietCalories = (diets || []).reduce(
                  (a, b) => a + (b.calories || 0),
                  0
                );

                res.json({
                  success: true,
                  data: {
                    user,
                    totalWorkouts: workouts?.length || 0,
                    totalCalories,
                    totalDietCalories,
                    totalSupplements: supplements?.length || 0,
                    workouts: workouts || [],
                    diets: diets || [],
                    supplements: supplements || []
                  }
                });

              }
            );
          }
        );
      }
    );
  });
});

/* ======================
   🔁 UPDATE ROLE
====================== */
router.patch("/users/:id", protect, adminOnly, (req, res) => {
  const { role } = req.body;

  db.query(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Update failed ❌"
        });
      }

      res.json({
        success: true,
        message: "Role updated ✅"
      });
    }
  );
});

/* ======================
   🚫 BAN / UNBAN USER
====================== */
router.put("/users/:id/ban", protect, adminOnly, (req, res) => {
  db.query(
    "UPDATE users SET isBanned = NOT isBanned WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Ban failed ❌"
        });
      }

      res.json({
        success: true,
        message: "User status updated ✅"
      });
    }
  );
});

/* ======================
   ❌ DELETE USER
====================== */
router.delete("/users/:id", protect, adminOnly, (req, res) => {
  if (req.user.id == req.params.id) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete yourself ❌"
    });
  }

  db.query(
    "DELETE FROM users WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Delete failed ❌"
        });
      }

      res.json({
        success: true,
        message: "User deleted ✅"
      });
    }
  );
});

/* ======================
   📊 GLOBAL STATS
====================== */
router.get("/stats", protect, adminOnly, (req, res) => {
  db.query("SELECT COUNT(*) AS users FROM users", (err, u) => {
    if (err) return res.status(500).json({ success: false });

    db.query("SELECT COUNT(*) AS workouts FROM workout_sessions", (err2, w) => {
      if (err2) return res.status(500).json({ success: false });

      db.query("SELECT COUNT(*) AS diets FROM diet_entries", (err3, d) => {
        if (err3) return res.status(500).json({ success: false });

        db.query("SELECT COUNT(*) AS supplements FROM supplement_intake", (err4, s) => {
          if (err4) return res.status(500).json({ success: false });

          res.json({
            success: true,
            data: {
              users: u?.[0]?.users || 0,
              workouts: w?.[0]?.workouts || 0,
              diets: d?.[0]?.diets || 0,
              supplements: s?.[0]?.supplements || 0
            }
          });
        });
      });
    });
  });
});

/* ======================
   🏆 TOP USERS
====================== */
router.get("/top-users", protect, adminOnly, (req, res) => {
  db.query(
    `SELECT 
      users.id,
      users.name,
      users.email,
      COUNT(workout_sessions.id) AS workouts,
      COALESCE(SUM(workout_sessions.totalCaloriesBurned),0) AS calories
     FROM users
     LEFT JOIN workout_sessions 
       ON users.id = workout_sessions.user_id
     GROUP BY users.id
     ORDER BY workouts DESC
     LIMIT 5`,
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Server Error ❌"
        });
      }

      res.json({
        success: true,
        data: results || []
      });
    }
  );
});
router.get("/chart-data", protect, adminOnly, (req, res) => {

  db.query(
    `SELECT DATE(created_at) as date, COUNT(*) as users
     FROM users
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    (err, userData) => {

      if (err) return res.status(500).json({ success: false });

      db.query(
        `SELECT DATE(created_at) as date, SUM(totalCaloriesBurned) as calories
         FROM workout_sessions
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        (err2, workoutData) => {

          if (err2) return res.status(500).json({ success: false });

          res.json({
            success: true,
            data: {
              users: userData,
              workouts: workoutData
            }
          });

        }
      );

    }
  );

});
module.exports = router;