
const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

const DEFAULT_MET = 5;
const MIN_MET = 1;
const MAX_MET = 20;
const MAX_EXERCISES = 100;
const MAX_SETS_PER_EXERCISE = 100;
const DEFAULT_BODY_WEIGHT_KG = 70;

function isPositiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0;
}

function isNonNegativeNumber(value) {
  return (
    value !== "" &&
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 0
  );
}

function calculateCalories(met, durationSeconds) {
  return (met * DEFAULT_BODY_WEIGHT_KG * (durationSeconds / 3600)) * 1;
}

function logDatabaseError(label, error) {
  console.error(`${label}:`, error);
}

/* ======================
   GET EXERCISES
====================== */
router.get("/exercises", async (req, res) => {
  try {
    const [results] = await db.promise().query(
      "SELECT * FROM exercises"
    );

    return res.json({
      success: true,
      data: results || [],
    });
  } catch (error) {
    logDatabaseError("GET EXERCISES ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load exercises.",
    });
  }
});

/* ======================
   CREATE WORKOUT SESSION
====================== */
router.post("/sessions", protect, async (req, res) => {
  const { exercises } = req.body || {};

  if (
    !Array.isArray(exercises) ||
    exercises.length === 0 ||
    exercises.length > MAX_EXERCISES
  ) {
    return res.status(400).json({
      success: false,
      message: `Choose between 1 and ${MAX_EXERCISES} exercises.`,
    });
  }

  const normalizedExercises = [];

  for (const exercise of exercises) {
    if (
      !exercise ||
      typeof exercise !== "object" ||
      Array.isArray(exercise)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid exercise data.",
      });
    }

    const exerciseId = exercise.exerciseId ?? exercise.id;

    if (!isPositiveId(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: "Each exercise must have a valid exercise ID.",
      });
    }

    if (
      !Array.isArray(exercise.sets) ||
      exercise.sets.length === 0 ||
      exercise.sets.length > MAX_SETS_PER_EXERCISE
    ) {
      return res.status(400).json({
        success: false,
        message: `Each exercise must have 1–${MAX_SETS_PER_EXERCISE} sets.`,
      });
    }

    const met =
      exercise.met === undefined || exercise.met === null
        ? DEFAULT_MET
        : Number(exercise.met);

    if (
      !Number.isFinite(met) ||
      met < MIN_MET ||
      met > MAX_MET
    ) {
      return res.status(400).json({
        success: false,
        message: `MET must be between ${MIN_MET} and ${MAX_MET}.`,
      });
    }

    const normalizedSets = [];

    for (const set of exercise.sets) {
      if (!set || typeof set !== "object" || Array.isArray(set)) {
        return res.status(400).json({
          success: false,
          message: "Invalid workout set.",
        });
      }

      const reps = set.reps ?? 0;
      const weight = set.weight ?? 0;
      const duration = set.duration ?? 0;

      if (
        !isNonNegativeNumber(reps) ||
        !Number.isSafeInteger(Number(reps)) ||
        !isNonNegativeNumber(weight) ||
        !isNonNegativeNumber(duration) ||
        !Number.isSafeInteger(Number(duration)) ||
        Number(duration) > 86400 ||
        Number(weight) > 10000 ||
        Number(reps) > 10000
      ) {
        return res.status(400).json({
          success: false,
          message: "Workout sets contain invalid reps, weight, or duration.",
        });
      }

      if (Number(reps) === 0 && Number(duration) === 0) {
        return res.status(400).json({
          success: false,
          message: "Each set must include reps or a duration.",
        });
      }

      normalizedSets.push({
        reps: Number(reps),
        weight: Number(weight),
        duration: Number(duration),
        caloriesBurned: Math.round(
          calculateCalories(met, Number(duration))
        ),
      });
    }

    normalizedExercises.push({
      exerciseId: Number(exerciseId),
      sets: normalizedSets,
    });
  }

  let connection;

  try {
    // Confirm every exercise exists before starting the transaction.
    const exerciseIds = [
      ...new Set(normalizedExercises.map((exercise) => exercise.exerciseId)),
    ];

    const [existingExercises] = await db.promise().query(
      `SELECT id FROM exercises
       WHERE id IN (${exerciseIds.map(() => "?").join(", ")})`,
      exerciseIds
    );

    const existingIds = new Set(
      existingExercises.map((exercise) => Number(exercise.id))
    );

    if (exerciseIds.some((id) => !existingIds.has(id))) {
      return res.status(400).json({
        success: false,
        message: "One or more exercises do not exist.",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    let totalDuration = 0;
    let totalCalories = 0;

    for (const exercise of normalizedExercises) {
      for (const set of exercise.sets) {
        totalDuration += set.duration;
        totalCalories += set.caloriesBurned;
      }
    }

    const [sessionResult] = await connection.query(
      `INSERT INTO workout_sessions
        (user_id, totalDuration, totalCaloriesBurned, created_at)
       VALUES (?, ?, ?, NOW())`,
      [
        req.user.id,
        totalDuration,
        Math.round(totalCalories),
      ]
    );

    const sessionId = sessionResult.insertId;

    for (const exercise of normalizedExercises) {
      for (const set of exercise.sets) {
        await connection.query(
          `INSERT INTO workout_exercises
            (session_id, exercise_id, reps, weight, duration, caloriesBurned)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            exercise.exerciseId,
            set.reps,
            set.weight,
            set.duration,
            set.caloriesBurned,
          ]
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Workout saved successfully.",
      sessionId,
      data: {
        totalDuration,
        totalCaloriesBurned: Math.round(totalCalories),
        exerciseCount: normalizedExercises.length,
        setCount: normalizedExercises.reduce(
          (total, exercise) => total + exercise.sets.length,
          0
        ),
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        logDatabaseError("WORKOUT ROLLBACK ERROR", rollbackError);
      }
    }

    logDatabaseError("CREATE WORKOUT ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save workout. No partial session was intended to be saved.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/* ======================
   GET CURRENT USER'S SESSIONS
====================== */
router.get("/sessions", protect, async (req, res) => {
  try {
    const [results] = await db.promise().query(
      `SELECT * FROM workout_sessions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: results || [],
    });
  } catch (error) {
    logDatabaseError("GET WORKOUT SESSIONS ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load workout sessions.",
    });
  }
});

/* ======================
   DELETE OWN WORKOUT SESSION
====================== */
router.delete("/sessions/:id", protect, async (req, res) => {
  const sessionId = req.params.id;

  if (!isPositiveId(sessionId)) {
    return res.status(400).json({
      success: false,
      message: "A valid workout session ID is required.",
    });
  }

  let connection;

  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [sessions] = await connection.query(
      `SELECT id FROM workout_sessions
       WHERE id = ? AND user_id = ?
       FOR UPDATE`,
      [Number(sessionId), req.user.id]
    );

    if (sessions.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Workout session not found.",
      });
    }

    // Delete child records first so foreign keys do not block deletion.
    await connection.query(
      "DELETE FROM workout_exercises WHERE session_id = ?",
      [Number(sessionId)]
    );

    await connection.query(
      "DELETE FROM workout_sessions WHERE id = ? AND user_id = ?",
      [Number(sessionId), req.user.id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Workout session deleted successfully.",
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        logDatabaseError("DELETE WORKOUT ROLLBACK ERROR", rollbackError);
      }
    }

    logDatabaseError("DELETE WORKOUT SESSION ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete workout session.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
