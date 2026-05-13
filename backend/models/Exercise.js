const db = require("../config/mysql");

/* =======================
   ✅ GET ALL EXERCISES
======================= */
const getExercises = () => {

  return new Promise((resolve, reject) => {

    db.query(
      "SELECT * FROM exercises",
      (err, results) => {

        if (err) {
          reject(err);
        } else {
          resolve(results);
        }

      }
    );

  });

};

/* =======================
   ✅ GET EXERCISE BY ID
======================= */
const getExerciseById = (id) => {

  return new Promise((resolve, reject) => {

    db.query(
      "SELECT * FROM exercises WHERE id = ?",
      [id],
      (err, results) => {

        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }

      }
    );

  });

};

/* =======================
   ✅ CREATE WORKOUT SESSION
======================= */
const createWorkoutSession = (
  userId,
  totalDuration,
  totalCaloriesBurned
) => {

  return new Promise((resolve, reject) => {

    db.query(
      `INSERT INTO workout_sessions
      (user_id, totalDuration, totalCaloriesBurned)
      VALUES (?, ?, ?)`,
      [
        userId,
        totalDuration,
        totalCaloriesBurned
      ],
      (err, result) => {

        if (err) {
          reject(err);
        } else {
          resolve(result);
        }

      }
    );

  });

};

module.exports = {
  getExercises,
  getExerciseById,
  createWorkoutSession
};