const db = require("../config/mysql");
const bcrypt = require("bcryptjs");

/* ======================
   ✅ CREATE USER
====================== */
const createUser = async (userData) => {

  const {
    name,
    email,
    password,
    role = "user"
  } = userData;

  // ✅ HASH PASSWORD
  const salt = await bcrypt.genSalt(10);

  const hashedPassword =
    await bcrypt.hash(password, salt);

  return new Promise((resolve, reject) => {

    db.query(
      `INSERT INTO users
      (
        name,
        email,
        password,
        role
      )
      VALUES (?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        role
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

/* ======================
   ✅ FIND USER BY EMAIL
====================== */
const findUserByEmail = (email) => {

  return new Promise((resolve, reject) => {

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
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

/* ======================
   ✅ FIND USER BY ID
====================== */
const findUserById = (id) => {

  return new Promise((resolve, reject) => {

    db.query(
      "SELECT * FROM users WHERE id = ?",
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

/* ======================
   ✅ MATCH PASSWORD
====================== */
const matchPassword = async (
  enteredPassword,
  hashedPassword
) => {

  return await bcrypt.compare(
    enteredPassword,
    hashedPassword
  );

};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  matchPassword
};