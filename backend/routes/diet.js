
const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

const ALLOWED_MEAL_TYPES = new Set([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "meal",
]);

function isPositiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0;
}

/* ======================
   GET FOODS
====================== */
router.get("/foods", (req, res) => {
  db.query(
    "SELECT * FROM foods ORDER BY name ASC",
    (err, results) => {
      if (err) {
        console.error("GET FOODS ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to load foods.",
        });
      }

      return res.json({
        success: true,
        data: results || [],
      });
    }
  );
});

/* ======================
   ADD DIET ENTRY
====================== */
router.post("/entries", protect, (req, res) => {
  const { food_id, quantity, mealType } = req.body || {};

  if (!isPositiveId(food_id)) {
    return res.status(400).json({
      success: false,
      message: "A valid food_id is required.",
    });
  }

  const parsedQuantity = Number(quantity);

  if (
    quantity === undefined ||
    quantity === null ||
    quantity === "" ||
    !Number.isFinite(parsedQuantity) ||
    parsedQuantity <= 0 ||
    parsedQuantity > 100000
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a positive number.",
    });
  }

  const normalizedMealType =
    typeof mealType === "string" ? mealType.trim().toLowerCase() : "meal";

  if (
    normalizedMealType.length > 30 ||
    !ALLOWED_MEAL_TYPES.has(normalizedMealType)
  ) {
    return res.status(400).json({
      success: false,
      message: "Choose a valid meal type.",
    });
  }

  db.query(
    "SELECT id, name, calories FROM foods WHERE id = ? LIMIT 1",
    [Number(food_id)],
    (foodErr, foods) => {
      if (foodErr) {
        console.error("LOOKUP FOOD ERROR:", foodErr);
        return res.status(500).json({
          success: false,
          message: "Unable to look up food.",
        });
      }

      if (!foods || foods.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Food not found.",
        });
      }

      const food = foods[0];
      const caloriesPer100g = Number(food.calories);

      if (
        !Number.isFinite(caloriesPer100g) ||
        caloriesPer100g < 0
      ) {
        console.error("Invalid calories configured for food:", food.id);
        return res.status(500).json({
          success: false,
          message: "Nutrition information is unavailable for this food.",
        });
      }

      // Existing app convention: food calories are stored per 100 g.
      const calories = Math.round(
        (caloriesPer100g * parsedQuantity) / 100
      );

      db.query(
        `
        INSERT INTO diet_entries
          (user_id, food_id, quantity, calories, mealType, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        `,
        [
          req.user.id,
          Number(food_id),
          parsedQuantity,
          calories,
          normalizedMealType,
        ],
        (insertErr, result) => {
          if (insertErr) {
            console.error("INSERT DIET ENTRY ERROR:", insertErr);
            return res.status(500).json({
              success: false,
              message: "Unable to save diet entry.",
            });
          }

          return res.status(201).json({
            success: true,
            message: "Diet entry added successfully.",
            data: {
              id: result.insertId,
              food_id: Number(food_id),
              foodName: food.name,
              quantity: parsedQuantity,
              calories,
              mealType: normalizedMealType,
            },
          });
        }
      );
    }
  );
});

/* ======================
   GET CURRENT USER'S ENTRIES
====================== */
router.get("/entries", protect, (req, res) => {
  db.query(
    `
    SELECT
      de.*,
      f.name,
      f.imageUrl
    FROM diet_entries AS de
    LEFT JOIN foods AS f ON f.id = de.food_id
    WHERE de.user_id = ?
    ORDER BY de.created_at DESC
    `,
    [req.user.id],
    (err, results) => {
      if (err) {
        console.error("GET DIET ENTRIES ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to load diet entries.",
        });
      }

      return res.json({
        success: true,
        data: results || [],
      });
    }
  );
});

/* ======================
   DELETE OWN ENTRY ONLY
====================== */
router.delete("/entries/:id", protect, (req, res) => {
  const entryId = req.params.id;

  if (!isPositiveId(entryId)) {
    return res.status(400).json({
      success: false,
      message: "A valid entry ID is required.",
    });
  }

  db.query(
    "DELETE FROM diet_entries WHERE id = ? AND user_id = ?",
    [Number(entryId), req.user.id],
    (err, result) => {
      if (err) {
        console.error("DELETE DIET ENTRY ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to delete diet entry.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Diet entry not found.",
        });
      }

      return res.json({
        success: true,
        message: "Diet entry deleted successfully.",
      });
    }
  );
});

module.exports = router;
