const db = require("../config/mysql");

/* =======================
   ✅ GET ALL FOODS
======================= */
const getFoods = () => {

  return new Promise((resolve, reject) => {

    db.query(
      "SELECT * FROM foods",
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
   ✅ GET FOOD BY ID
======================= */
const getFoodById = (id) => {

  return new Promise((resolve, reject) => {

    db.query(
      "SELECT * FROM foods WHERE id = ?",
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
   ✅ CREATE DIET ENTRY
======================= */
const createDietEntry = (
  userId,
  mealType,
  foodId,
  quantity,
  calories,
  protein,
  carbs,
  fats
) => {

  return new Promise((resolve, reject) => {

    db.query(
      `INSERT INTO diet_entries
      (
        user_id,
        mealType,
        food_id,
        quantity,
        calories,
        protein,
        carbs,
        fats
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        mealType,
        foodId,
        quantity,
        calories,
        protein,
        carbs,
        fats
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
  getFoods,
  getFoodById,
  createDietEntry
};