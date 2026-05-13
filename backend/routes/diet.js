const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

/* ======================
   GET FOODS
====================== */
router.get("/foods", (req, res) => {

  db.query("SELECT * FROM foods", (err, results) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Server Error ❌"
      });
    }

    res.json({
      success: true,
      data: results
    });

  });

});


/* ======================
   ADD DIET ENTRY (FIXED STRONG)
====================== */
router.post("/entries", protect, (req, res) => {

  const { food_id, quantity, mealType } = req.body;

  // 🔥 FIX 1: validation strict
  if (!food_id || !quantity) {
    return res.status(400).json({
      success: false,
      message: "food_id & quantity required ❌"
    });
  }

  db.query(
    "SELECT * FROM foods WHERE id = ?",
    [food_id],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: "DB Error ❌"
        });
      }

      if (!results.length) {
        return res.status(404).json({
          success: false,
          message: "Food not found ❌"
        });
      }

      const food = results[0];

      // 🔥 FIX 2: safe number conversion
      const calories =
        (Number(food.calories || 0) * Number(quantity)) / 100;

      db.query(
        `INSERT INTO diet_entries
        (user_id, food_id, quantity, calories, mealType, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          food_id,
          quantity,
          Math.round(calories),
          mealType || "meal"
        ],
        (err) => {

          if (err) {
            console.log(err);
            return res.status(500).json({
              success: false,
              message: "Insert failed ❌"
            });
          }

          res.json({
            success: true,
            message: "Diet entry added ✅"
          });

        }
      );

    }
  );

});


/* ======================
   GET DIET ENTRIES (FIXED JOIN SAFE)
====================== */
router.get("/entries", protect, (req, res) => {

  db.query(
    `SELECT 
      de.*,
      f.name,
      f.imageUrl
     FROM diet_entries de
     LEFT JOIN foods f ON de.food_id = f.id
     WHERE de.user_id = ?
     ORDER BY de.created_at DESC`,
    [req.user.id],
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


/* ======================
   DELETE ENTRY
====================== */
router.delete("/entries/:id", protect, (req, res) => {

  db.query(
    "DELETE FROM diet_entries WHERE id = ?",
    [req.params.id],
    (err) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: "Server Error ❌"
        });
      }

      res.json({
        success: true,
        message: "Deleted ✅"
      });

    }
  );

});

module.exports = router;