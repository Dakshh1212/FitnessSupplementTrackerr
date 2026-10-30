
const db = require("../config/mysql");

/**
 * Get all foods without removing or filtering existing food items.
 */
const getFoods = async () => {
  const [rows] = await db.promise().query(
    "SELECT * FROM foods ORDER BY id ASC"
  );

  return rows;
};

/**
 * Get one food by ID.
 */
const getFoodById = async (id) => {
  const foodId = Number(id);

  if (!Number.isSafeInteger(foodId) || foodId <= 0) {
    return null;
  }

  const [rows] = await db.promise().query(
    "SELECT * FROM foods WHERE id = ? LIMIT 1",
    [foodId]
  );

  return rows[0] || null;
};

/**
 * Create a diet entry.
 */
const createDietEntry = async (
  userId,
  mealType,
  foodId,
  quantity,
  calories,
  protein,
  carbs,
  fats
) => {
  const parsedUserId = Number(userId);
  const parsedFoodId = Number(foodId);
  const parsedQuantity = Number(quantity);
  const parsedCalories = Number(calories);
  const parsedProtein = Number(protein);
  const parsedCarbs = Number(carbs);
  const parsedFats = Number(fats);

  if (!Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
    throw new Error("A valid user ID is required.");
  }

  if (!Number.isSafeInteger(parsedFoodId) || parsedFoodId <= 0) {
    throw new Error("A valid food ID is required.");
  }

  if (
    !Number.isFinite(parsedQuantity) ||
    parsedQuantity <= 0 ||
    parsedQuantity > 100000
  ) {
    throw new Error("Food quantity must be a positive, valid number.");
  }

  const nutritionValues = [
    parsedCalories,
    parsedProtein,
    parsedCarbs,
    parsedFats,
  ];

  if (
    nutritionValues.some(
      (value) => !Number.isFinite(value) || value < 0
    )
  ) {
    throw new Error("Nutrition values must be valid non-negative numbers.");
  }

  if (
    typeof mealType !== "string" ||
    !mealType.trim() ||
    mealType.trim().length > 50
  ) {
    throw new Error("A valid meal type is required.");
  }

  const [result] = await db.promise().query(
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
      parsedUserId,
      mealType.trim(),
      parsedFoodId,
      parsedQuantity,
      parsedCalories,
      parsedProtein,
      parsedCarbs,
      parsedFats,
    ]
  );

  return result;
};

module.exports = {
  getFoods,
  getFoodById,
  createDietEntry,
};
