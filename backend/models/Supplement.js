
const db = require("../config/mysql");

/**
 * Get all supplements.
 */
const getSupplements = async () => {
  const [rows] = await db.promise().query(
    "SELECT * FROM supplements ORDER BY id ASC"
  );

  return rows;
};

/**
 * Get a supplement by ID.
 */
const getSupplementById = async (id) => {
  const supplementId = Number(id);

  if (!Number.isSafeInteger(supplementId) || supplementId <= 0) {
    return null;
  }

  const [rows] = await db.promise().query(
    "SELECT * FROM supplements WHERE id = ? LIMIT 1",
    [supplementId]
  );

  return rows[0] || null;
};

/**
 * Record a supplement intake.
 */
const createSupplementIntake = async (
  userId,
  supplementId,
  timing,
  notes
) => {
  const parsedUserId = Number(userId);
  const parsedSupplementId = Number(supplementId);

  if (!Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
    throw new Error("A valid user ID is required.");
  }

  if (
    !Number.isSafeInteger(parsedSupplementId) ||
    parsedSupplementId <= 0
  ) {
    throw new Error("A valid supplement ID is required.");
  }

  if (
    typeof timing !== "string" ||
    !timing.trim() ||
    timing.trim().length > 50
  ) {
    throw new Error("A valid supplement timing is required.");
  }

  if (
    notes !== undefined &&
    notes !== null &&
    (typeof notes !== "string" || notes.length > 1000)
  ) {
    throw new Error("Notes must be text of at most 1000 characters.");
  }

  const [result] = await db.promise().query(
    `INSERT INTO supplement_intake
      (user_id, supplement_id, timing, notes)
     VALUES (?, ?, ?, ?)`,
    [
      parsedUserId,
      parsedSupplementId,
      timing.trim(),
      notes == null ? null : notes.trim(),
    ]
  );

  return result;
};

module.exports = {
  getSupplements,
  getSupplementById,
  createSupplementIntake,
};
