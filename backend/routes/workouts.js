const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");


/* ======================
   📦 GET EXERCISES
====================== */
router.get("/exercises", (req, res) => {

  db.query("SELECT * FROM exercises", (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Server Error ❌"
      });
    }

    return res.json({
      success: true,
      data: results || []
    });

  });

});


/* ======================
   ➕ CREATE SESSION (FULL SAFE FIX)
====================== */
router.post("/sessions", protect, (req, res) => {

  try {

    const { exercises } = req.body;

    // 🔥 VALIDATION
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid exercises ❌"
      });
    }

    let totalDuration = 0;
    let totalCalories = 0;

    // ================= CALCULATION =================
    exercises.forEach((ex) => {

      const met = ex.met || 5;

      (ex.sets || []).forEach((set) => {

        const duration = Number(set.duration || 0);

        totalDuration += duration;
        totalCalories += met * 70 * (duration / 60);

      });

    });


    // ================= INSERT SESSION =================
    db.query(
      `INSERT INTO workout_sessions
       (user_id, totalDuration, totalCaloriesBurned, created_at)
       VALUES (?, ?, ?, NOW())`,
      [
        req.user.id,
        totalDuration,
        Math.round(totalCalories)
      ],
      (err, result) => {

        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Database error ❌"
          });
        }

        const sessionId = result.insertId;

        // ================= INSERT EXERCISES =================
        exercises.forEach((ex) => {

          (ex.sets || []).forEach((set) => {

            const duration = Number(set.duration || 0);
            const met = ex.met || 5;

            db.query(
              `INSERT INTO workout_exercises
               (session_id, exercise_id, reps, weight, duration, caloriesBurned)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                sessionId,
                ex.exerciseId || ex.id,
                set.reps || 0,
                set.weight || 0,
                duration,
                Math.round(met * 70 * (duration / 60))
              ]
            );

          });

        });

        return res.json({
          success: true,
          message: "Workout saved ✅",
          sessionId
        });

      }
    );

  } catch (err) {

    console.log("WORKOUT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server Error ❌"
    });

  }

});


/* ======================
   📊 GET SESSIONS
====================== */
router.get("/sessions", protect, (req, res) => {

  db.query(
    `SELECT * FROM workout_sessions
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [req.user.id],
    (err, results) => {

      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Server Error ❌"
        });
      }

      return res.json({
        success: true,
        data: results || []
      });

    }
  );

});


/* ======================
   ❌ DELETE SESSION
====================== */
router.delete("/sessions/:id", protect, (req, res) => {

  db.query(
    "DELETE FROM workout_sessions WHERE id = ?",
    [req.params.id],
    (err) => {

      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Server Error ❌"
        });
      }

      return res.json({
        success: true,
        message: "Deleted successfully ✅"
      });

    }
  );

});

module.exports = router;