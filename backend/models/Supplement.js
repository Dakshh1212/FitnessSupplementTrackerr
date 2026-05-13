const db = require("../config/mysql");

/* =======================
   ✅ GET ALL SUPPLEMENTS
======================= */
const getSupplements = () => {

  return new Promise((resolve, reject) => {

    db.query(
      "SELECT * FROM supplements",
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
   ✅ GET SUPPLEMENT BY ID
======================= */
const getSupplementById = (id) => {

  return new Promise((resolve, reject) => {

    db.query(
      "SELECT * FROM supplements WHERE id = ?",
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
   ✅ CREATE INTAKE
======================= */
const createSupplementIntake = (
  userId,
  supplementId,
  timing,
  notes
) => {

  return new Promise((resolve, reject) => {

    db.query(
      `INSERT INTO supplement_intake
      (
        user_id,
        supplement_id,
        timing,
        notes
      )
      VALUES (?, ?, ?, ?)`,
      [
        userId,
        supplementId,
        timing,
        notes
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
  getSupplements,
  getSupplementById,
  createSupplementIntake
};