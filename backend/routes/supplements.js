
const express = require("express");
const router = express.Router();

const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

const VALID_TIMINGS = new Set([
  "morning",
  "afternoon",
  "evening",
  "night",
  "pre_workout",
  "post_workout",
  "with_meal",
]);
const MAX_PLAN_ITEMS = 50;

function isPositiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0;
}

function normalizeTiming(value) {
  if (value === undefined || value === null || value === "") {
    return "morning";
  }

  if (typeof value !== "string") return null;

  const timing = value.trim().toLowerCase();
  return VALID_TIMINGS.has(timing) ? timing : null;
}

function logDatabaseError(label, error) {
  console.error(`${label}:`, error);
}

function validServings(value) {
  const servings = Number(value === undefined ? 1 : value);
  return Number.isFinite(servings) && servings > 0 && servings <= 100
    ? servings
    : null;
}

/* GET ALL SUPPLEMENTS */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT id, name, brand, price, imageUrl, buyLink, category,
              proteinPerServing, caloriesPerServing, servingSize
       FROM supplements
       ORDER BY name ASC`
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    logDatabaseError("GET SUPPLEMENTS ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load supplements.",
    });
  }
});

/* LOG A SUPPLEMENT ACTUALLY CONSUMED */
router.post("/take", protect, async (req, res) => {
  const { supplementId, timing } = req.body || {};
  const servings = validServings(req.body?.servings);
  const normalizedTiming = normalizeTiming(timing);

  if (!isPositiveId(supplementId)) {
    return res.status(400).json({
      success: false,
      message: "A valid supplement ID is required.",
    });
  }

  if (!servings) {
    return res.status(400).json({
      success: false,
      message: "Servings must be greater than 0 and no more than 100.",
    });
  }

  if (!normalizedTiming) {
    return res.status(400).json({
      success: false,
      message: "Choose a valid supplement timing.",
    });
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT id, name, proteinPerServing, caloriesPerServing,
              servingSize
       FROM supplements
       WHERE id = ?
       LIMIT 1`,
      [Number(supplementId)]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Supplement not found.",
      });
    }

    const supplement = rows[0];

    const [result] = await db.promise().query(
      `INSERT INTO supplement_intake
         (user_id, supplement_id, timing, servings)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, Number(supplementId), normalizedTiming, servings]
    );

    const protein =
      Number(supplement.proteinPerServing || 0) * servings;
    const calories =
      Number(supplement.caloriesPerServing || 0) * servings;

    return res.status(201).json({
      success: true,
      message: "Supplement intake logged successfully.",
      data: {
        id: result.insertId,
        supplementId: Number(supplementId),
        name: supplement.name,
        timing: normalizedTiming,
        servings,
        protein: Number(protein.toFixed(2)),
        calories: Number(calories.toFixed(2)),
      },
    });
  } catch (error) {
    logDatabaseError("TAKE SUPPLEMENT ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save supplement intake.",
    });
  }
});

/* CREATE A SUPPLEMENT PLAN */
router.post("/plans", protect, async (req, res) => {
  const { name, goal, supplements } = req.body || {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Plan name must contain 1–100 characters.",
    });
  }

  if (
    goal != null &&
    (typeof goal !== "string" || goal.trim().length > 100)
  ) {
    return res.status(400).json({
      success: false,
      message: "Plan goal must be text of at most 100 characters.",
    });
  }

  if (
    !Array.isArray(supplements) ||
    supplements.length < 1 ||
    supplements.length > MAX_PLAN_ITEMS
  ) {
    return res.status(400).json({
      success: false,
      message: `A plan must contain 1–${MAX_PLAN_ITEMS} supplements.`,
    });
  }

  const items = [];

  for (const item of supplements) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      !isPositiveId(item.supplement)
    ) {
      return res.status(400).json({
        success: false,
        message: "Each plan item needs a valid supplement ID.",
      });
    }

    if (
      item.dosage != null &&
      (typeof item.dosage !== "object" || Array.isArray(item.dosage))
    ) {
      return res.status(400).json({
        success: false,
        message: "Dosage must be an object.",
      });
    }

    const frequency = item.frequency ?? "daily";

    if (
      typeof frequency !== "string" ||
      !frequency.trim() ||
      frequency.trim().length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Each supplement needs a valid frequency.",
      });
    }

    let dosage;

    try {
      dosage = JSON.stringify(item.dosage || {});
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid dosage data.",
      });
    }

    const timing = normalizeTiming(item.timing);

    if (!timing) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid timing for each supplement.",
      });
    }

    items.push({
      supplementId: Number(item.supplement),
      dosage,
      frequency: frequency.trim(),
      timing,
    });
  }

  const ids = [...new Set(items.map((item) => item.supplementId))];
  let connection;

  try {
    const [existing] = await db.promise().query(
      `SELECT id FROM supplements
       WHERE id IN (${ids.map(() => "?").join(", ")})`,
      ids
    );

    const existingIds = new Set(existing.map((row) => Number(row.id)));

    if (ids.some((id) => !existingIds.has(id))) {
      return res.status(400).json({
        success: false,
        message: "One or more selected supplements do not exist.",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [planResult] = await connection.query(
      `INSERT INTO supplement_plans (user_id, name, goal)
       VALUES (?, ?, ?)`,
      [req.user.id, name.trim(), (goal || "general").trim()]
    );

    for (const item of items) {
      await connection.query(
        `INSERT INTO supplement_plan_items
           (plan_id, supplement_id, dosage, frequency, timing)
         VALUES (?, ?, ?, ?, ?)`,
        [
          planResult.insertId,
          item.supplementId,
          item.dosage,
          item.frequency,
          item.timing,
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Supplement plan created successfully.",
      planId: planResult.insertId,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        logDatabaseError("PLAN ROLLBACK ERROR", rollbackError);
      }
    }

    logDatabaseError("CREATE SUPPLEMENT PLAN ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create supplement plan.",
    });
  } finally {
    if (connection) connection.release();
  }
});

/* GET THE CURRENT USER'S PLANS AND ITEMS */
router.get("/plans", protect, async (req, res) => {
  try {
    const [plans] = await db.promise().query(
      `SELECT id, name, goal, created_at
       FROM supplement_plans
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    if (!plans.length) {
      return res.json({ success: true, data: [] });
    }

    const planIds = plans.map((plan) => plan.id);

    const [items] = await db.promise().query(
      `SELECT
         pi.id,
         pi.plan_id,
         pi.supplement_id,
         pi.dosage,
         pi.frequency,
         pi.timing,
         s.name AS supplementName,
         s.brand,
         s.proteinPerServing,
         s.caloriesPerServing,
         s.servingSize
       FROM supplement_plan_items pi
       JOIN supplement_plans p ON p.id = pi.plan_id
       JOIN supplements s ON s.id = pi.supplement_id
       WHERE p.user_id = ?
         AND pi.plan_id IN (${planIds.map(() => "?").join(", ")})
       ORDER BY pi.id ASC`,
      [req.user.id, ...planIds]
    );

    const grouped = plans.map((plan) => ({
      ...plan,
      supplements: items.filter(
        (item) => Number(item.plan_id) === Number(plan.id)
      ),
    }));

    return res.json({ success: true, data: grouped });
  } catch (error) {
    logDatabaseError("GET SUPPLEMENT PLANS ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load supplement plans.",
    });
  }
});

/* DELETE A SAVED PLAN BELONGING TO THE CURRENT USER */
router.delete("/plans/:id", protect, async (req, res) => {
  const planId = req.params.id;

  if (!isPositiveId(planId)) {
    return res.status(400).json({
      success: false,
      message: "A valid plan ID is required.",
    });
  }

  let connection;

  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // Verify ownership before deleting anything.
    const [plans] = await connection.query(
      `SELECT id
       FROM supplement_plans
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [Number(planId), req.user.id]
    );

    if (plans.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Saved plan not found.",
      });
    }

    // Delete the plan's associated items first.
    await connection.query(
      `DELETE FROM supplement_plan_items
       WHERE plan_id = ?`,
      [Number(planId)]
    );

    // Then delete the plan itself.
    await connection.query(
      `DELETE FROM supplement_plans
       WHERE id = ? AND user_id = ?`,
      [Number(planId), req.user.id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Supplement plan deleted successfully.",
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        logDatabaseError("DELETE PLAN ROLLBACK ERROR", rollbackError);
      }
    }

    logDatabaseError("DELETE SUPPLEMENT PLAN ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete supplement plan.",
    });
  } finally {
    if (connection) connection.release();
  }
});


/* GET INTAKE HISTORY */
router.get("/intake", protect, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         si.id,
         si.supplement_id,
         s.name,
         s.brand,
         s.servingSize,
         s.proteinPerServing,
         s.caloriesPerServing,
         si.servings,
         si.timing,
         si.created_at,
         ROUND(COALESCE(s.proteinPerServing, 0) * si.servings, 2)
           AS proteinConsumed,
         ROUND(COALESCE(s.caloriesPerServing, 0) * si.servings, 2)
           AS caloriesConsumed
       FROM supplement_intake si
       JOIN supplements s ON s.id = si.supplement_id
       WHERE si.user_id = ?
       ORDER BY si.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    logDatabaseError("GET SUPPLEMENT INTAKE ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load supplement intake history.",
    });
  }
});

/* TODAY'S CONSUMED SUPPLEMENT NUTRITION */
router.get("/nutrition/today", protect, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         ROUND(COALESCE(SUM(si.servings * s.proteinPerServing), 0), 2)
           AS proteinConsumed,
         ROUND(COALESCE(SUM(si.servings * s.caloriesPerServing), 0), 2)
           AS caloriesConsumed,
         COUNT(si.id) AS intakeCount
       FROM supplement_intake si
       JOIN supplements s ON s.id = si.supplement_id
       WHERE si.user_id = ?
         AND si.created_at >= CURDATE()
         AND si.created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: {
        proteinConsumed: Number(rows[0].proteinConsumed || 0),
        caloriesConsumed: Number(rows[0].caloriesConsumed || 0),
        intakeCount: Number(rows[0].intakeCount || 0),
      },
    });
  } catch (error) {
    logDatabaseError("GET SUPPLEMENT NUTRITION ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to calculate today's supplement nutrition.",
    });
  }
});

/* TODAY'S SUPPLEMENT INTAKE HISTORY */
router.get("/reminders/today", protect, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         si.id,
         s.name,
         si.servings,
         si.timing,
         si.created_at,
         ROUND(COALESCE(s.proteinPerServing, 0) * si.servings, 2)
           AS proteinConsumed,
         ROUND(COALESCE(s.caloriesPerServing, 0) * si.servings, 2)
           AS caloriesConsumed
       FROM supplement_intake si
       JOIN supplements s ON s.id = si.supplement_id
       WHERE si.user_id = ?
         AND si.created_at >= CURDATE()
         AND si.created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
       ORDER BY si.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    logDatabaseError("GET TODAY'S SUPPLEMENT INTAKE ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load today's supplement intake.",
    });
  }
});

module.exports = router;
