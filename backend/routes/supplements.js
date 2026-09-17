const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

/* ======================
   💊 GET ALL SUPPLEMENTS
====================== */
router.get("/", (req, res) => {

  db.query(
    "SELECT * FROM supplements",
    (err, results) => {

      if (err) {
        console.log("GET SUPPLEMENTS ERROR:", err);
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
   💊 TAKE SUPPLEMENT (USER INTAKE)
====================== */
router.post("/take", protect, (req, res) => {

  const userId = req.user.id;
  const { supplementId, timing } = req.body;

  if (!supplementId) {
    return res.status(400).json({
      success: false,
      message: "Supplement ID required ❌"
    });
  }

  db.query(
    `INSERT INTO supplement_intake (user_id, supplement_id, timing)
     VALUES (?, ?, ?)`,
    [userId, supplementId, timing || "morning"],
    (err) => {

      if (err) {
        console.log("TAKE SUPPLEMENT ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to save intake ❌"
        });
      }

      res.json({
        success: true,
        message: "Supplement logged 💊"
      });

    }
  );

});


/* ======================
   📦 CREATE PLAN
====================== */
router.post("/plans", protect, (req, res) => {

  const { name, goal, supplements } = req.body;

  if (!name || !Array.isArray(supplements)) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan data ❌"
    });
  }

  db.query(
    "INSERT INTO supplement_plans (user_id, name, goal) VALUES (?, ?, ?)",
    [req.user.id, name, goal || "general"],
    (err, result) => {

      if (err) {
        console.log("CREATE PLAN ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Server Error ❌"
        });
      }

      const planId = result.insertId;

      const insertItems = (index = 0) => {

        if (index >= supplements.length) {
          return res.json({
            success: true,
            message: "Plan created ✅",
            planId
          });
        }

        const s = supplements[index];

        db.query(
          `INSERT INTO supplement_plan_items
           (plan_id, supplement_id, dosage, frequency)
           VALUES (?, ?, ?, ?)`,
          [
            planId,
            s.supplement,
            JSON.stringify(s.dosage || {}),
            s.frequency || "daily"
          ],
          (err) => {

            if (err) {
              console.log("PLAN ITEM ERROR:", err);
              return res.status(500).json({
                success: false,
                message: "Plan item insert failed ❌"
              });
            }

            insertItems(index + 1);

          }
        );

      };

      insertItems();

    }
  );

});


/* ======================
   📋 GET PLANS
====================== */
router.get("/plans", protect, (req, res) => {

  db.query(
    `SELECT * FROM supplement_plans
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [req.user.id],
    (err, results) => {

      if (err) {
        console.log("GET PLANS ERROR:", err);
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
   📋 GET INTAKE HISTORY
====================== */
router.get("/intake", protect, (req, res) => {

  db.query(
    `
    SELECT
      si.id,
      si.supplement_id,
      s.name,
      si.timing,
      si.created_at
    FROM supplement_intake si
    JOIN supplements s
      ON si.supplement_id = s.id
    WHERE si.user_id = ?
    ORDER BY si.created_at DESC
    `,
    [req.user.id],
    (err, results) => {

      if (err) {
        console.log("GET INTAKE ERROR:", err);
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
   🔔 TODAY REMINDERS
====================== */
router.get("/reminders/today", protect, (req, res) => {

  db.query(
    `
    SELECT s.name, si.timing, si.created_at
    FROM supplement_intake si
    JOIN supplements s ON si.supplement_id = s.id
    WHERE si.user_id = ?
    AND DATE(si.created_at) = CURDATE()
    ORDER BY si.created_at DESC
    `,
    [req.user.id],
    (err, results) => {

      if (err) {
        console.log("REMINDERS ERROR:", err);
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

module.exports = router;