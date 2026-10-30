
const db = require("../config/mysql");

/**
 * Get all available exercises.
 */
const getExercises = async () => {
  const [rows] = await db.promise().query(
    "SELECT * FROM exercises ORDER BY id ASC"
  );

  return rows;
};

/**
 * Get one exercise by ID.
 */
const getExerciseById = async (id) => {
  const exerciseId = Number(id);

  if (!Number.isSafeInteger(exerciseId) || exerciseId <= 0) {
    return null;
  }

  const [rows] = await db.promise().query(
    "SELECT * FROM exercises WHERE id = ? LIMIT 1",
    [exerciseId]
  );

  return rows[0] || null;
};

/**
 * Create a workout session.
 */
const createWorkoutSession = async (
  userId,
  totalDuration,
  totalCaloriesBurned
) => {
  const parsedUserId = Number(userId);
  const parsedDuration = Number(totalDuration);
  const parsedCalories = Number(totalCaloriesBurned);

  if (!Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
    throw new Error("A valid user ID is required.");
  }

  if (
    !Number.isFinite(parsedDuration) ||
    parsedDuration < 0 ||
    !Number.isFinite(parsedCalories) ||
    parsedCalories < 0
  ) {
    throw new Error("Workout duration and calories must be valid non-negative numbers.");
  }

  const [result] = await db.promise().query(
    `INSERT INTO workout_sessions
      (user_id, totalDuration, totalCaloriesBurned)
     VALUES (?, ?, ?)`,
    [
      parsedUserId,
      parsedDuration,
      parsedCalories,
    ]
  );

  return result;
};

module.exports = {
  getExercises,
  getExerciseById,
  createWorkoutSession,
};
