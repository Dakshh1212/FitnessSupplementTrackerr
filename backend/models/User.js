
const db = require("../config/mysql");
const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 12;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/* ======================
   CREATE USER
====================== */
async function createUser(userData) {
  if (!userData || typeof userData !== "object") {
    throw new TypeError("Valid user data is required.");
  }

  const name =
    typeof userData.name === "string" ? userData.name.trim() : "";
  const email = normalizeEmail(userData.email);
  const password = userData.password;
  const role = userData.role || "user";

  if (!name || name.length > 100) {
    throw new TypeError("Name must contain 1–100 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new TypeError("A valid email address is required.");
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new TypeError("Password must be at least 8 characters and within the supported length.");
  }

  if (!["user", "admin"].includes(role)) {
    throw new TypeError("Invalid user role.");
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const [result] = await db.promise().query(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    [name, email, hashedPassword, role]
  );

  return result;
}

/* ======================
   FIND USER BY EMAIL
   Internal use: includes password hash.
====================== */
async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return undefined;
  }

  const [results] = await db.promise().query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );

  return results[0];
}

/* ======================
   FIND USER BY ID
   Internal use: includes password hash.
====================== */
async function findUserById(id) {
  const userId = Number(id);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return undefined;
  }

  const [results] = await db.promise().query(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  return results[0];
}

/* ======================
   MATCH PASSWORD
====================== */
async function matchPassword(enteredPassword, hashedPassword) {
  if (
    typeof enteredPassword !== "string" ||
    typeof hashedPassword !== "string"
  ) {
    return false;
  }

  return bcrypt.compare(enteredPassword, hashedPassword);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  matchPassword,
};
