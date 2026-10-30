
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = require("../config/mysql");
const sendWelcomeEmail = require("../utils/sendEmail");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const BCRYPT_ROUNDS = 12;

/* ================= HELPERS ================= */

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(email) {
  return email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidNumber(value, min, max) {
  if (value === undefined || value === null || value === "" ||
      typeof value === "boolean") return false;

  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return process.env.JWT_SECRET;
}

function generateToken(user) {
  return jwt.sign({ id: user.id }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    age: user.age ?? null,
    height: user.height ?? null,
    weight: user.weight ?? null,
    gender: user.gender ?? null,
    goal: user.goal ?? null,
    activityLevel: user.activityLevel ?? null,
    foodPreference: user.foodPreference ?? null,
    photo: user.photo ?? null,
    isOnboardingComplete:
      user.isOnboardingComplete === true ||
      Number(user.isOnboardingComplete) === 1,
  };
}

function logAuthError(label, error) {
  console.error(`${label}:`, error.message);
}

async function getUserById(id) {
  const [users] = await db.promise().query(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return users[0] || null;
}

/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body.email);
  const password = body.password;

  if (!name || name.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Name is required (maximum 100 characters).",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  if (typeof password !== "string" || password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters.",
    });
  }

  if (body.height != null && body.height !== "" &&
      !isValidNumber(body.height, 50, 300)) {
    return res.status(400).json({
      success: false,
      message: "Height must be between 50 and 300 cm.",
    });
  }

  if (body.weight != null && body.weight !== "" &&
      !isValidNumber(body.weight, 20, 500)) {
    return res.status(400).json({
      success: false,
      message: "Weight must be between 20 and 500 kg.",
    });
  }

  try {
    getJwtSecret();

    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const height = body.height == null || body.height === ""
      ? null : Number(body.height);
    const weight = body.weight == null || body.weight === ""
      ? null : Number(body.weight);

    const [result] = await db.promise().query(
      `INSERT INTO users
        (name, email, password, height, weight, isOnboardingComplete)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [name, email, hashedPassword, height, weight]
    );

    const user = await getUserById(result.insertId);
    const token = generateToken(user);

    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      logAuthError("WELCOME EMAIL ERROR", emailError);
    }

    return res.status(201).json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    logAuthError("REGISTER ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create your account right now.",
    });
  }
});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!isValidEmail(email) || typeof password !== "string" || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email and password.",
    });
  }

  try {
    getJwtSecret();

    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    if (Number(user.isBanned) === 1) {
      return res.status(403).json({
        success: false,
        message: "This account is currently disabled.",
      });
    }

    const matches = await bcrypt.compare(password, user.password || "");

    if (!matches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.json({
      success: true,
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    logAuthError("LOGIN ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to log in right now.",
    });
  }
});

/* ================= CURRENT USER ================= */

router.get("/me", protect, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (Number(user.isBanned) === 1) {
      return res.status(403).json({
        success: false,
        message: "This account is currently disabled.",
      });
    }

    return res.json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    logAuthError("GET ME ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch your profile.",
    });
  }
});

/* ================= UPDATE PROFILE ================= */

router.put("/update", protect, async (req, res) => {
  const body = req.body || {};

  const rules = {
    name: {
      check: v => typeof v === "string" && v.trim().length >= 1 &&
        v.trim().length <= 100,
      value: v => v.trim(),
      message: "Name must contain 1–100 characters.",
    },
    age: {
      check: v => isValidNumber(v, 13, 120) &&
        Number.isInteger(Number(v)),
      value: Number,
      message: "Age must be a whole number between 13 and 120.",
    },
    height: {
      check: v => isValidNumber(v, 50, 300),
      value: Number,
      message: "Height must be between 50 and 300 cm.",
    },
    weight: {
      check: v => isValidNumber(v, 20, 500),
      value: Number,
      message: "Weight must be between 20 and 500 kg.",
    },
    gender: {
      check: v => typeof v === "string" && v.trim().length <= 30 &&
        v.trim().length > 0,
      value: v => v.trim(),
      message: "Please provide a valid gender.",
    },
    goal: {
      check: v => typeof v === "string" && v.trim().length > 0 &&
        v.trim().length <= 50,
      value: v => v.trim(),
      message: "Please provide a valid fitness goal.",
    },
    activityLevel: {
      check: v => typeof v === "string" && v.trim().length > 0 &&
        v.trim().length <= 50,
      value: v => v.trim(),
      message: "Please provide a valid activity level.",
    },
    foodPreference: {
      check: v => ["veg", "non-veg", "vegan"].includes(v),
      value: v => v,
      message: "Food preference must be veg, non-veg, or vegan.",
    },
    photo: {
      check: v => v === null ||
        (typeof v === "string" && v.length <= 2000000),
      value: v => v,
      message: "Photo data is too large or invalid.",
    },
  };

  const fields = [];
  const values = [];

  for (const [field, rule] of Object.entries(rules)) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;

    const value = body[field];

    if (value === null && ["age", "height", "weight", "photo"].includes(field)) {
      fields.push(`${field} = ?`);
      values.push(null);
      continue;
    }

    if (!rule.check(value)) {
      return res.status(400).json({
        success: false,
        message: rule.message,
      });
    }

    fields.push(`${field} = ?`);
    values.push(rule.value(value));
  }

  if (!fields.length) {
    return res.status(400).json({
      success: false,
      message: "No profile fields were provided.",
    });
  }

  try {
    values.push(req.user.id);

    await db.promise().query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    logAuthError("UPDATE PROFILE ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update your profile.",
    });
  }
});

/* ================= COMPLETE ONBOARDING ================= */

router.post("/onboarding", protect, async (req, res) => {
  const body = req.body || {};
  const { age, height, weight, goal, activityLevel, gender, foodPreference } = body;

  if (!isValidNumber(age, 13, 120) || !Number.isInteger(Number(age))) {
    return res.status(400).json({
      success: false,
      message: "Age must be a whole number between 13 and 120.",
    });
  }

  if (!isValidNumber(height, 50, 300)) {
    return res.status(400).json({
      success: false,
      message: "Height must be between 50 and 300 cm.",
    });
  }

  if (!isValidNumber(weight, 20, 500)) {
    return res.status(400).json({
      success: false,
      message: "Weight must be between 20 and 500 kg.",
    });
  }

  if (typeof goal !== "string" || !goal.trim() || goal.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid fitness goal.",
    });
  }

  if (typeof activityLevel !== "string" || !activityLevel.trim() ||
      activityLevel.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: "Please select an activity level.",
    });
  }

  if (gender != null && gender !== "" &&
      (typeof gender !== "string" || gender.trim().length > 30)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid gender.",
    });
  }

  if (foodPreference != null &&
      !["veg", "non-veg", "vegan"].includes(foodPreference)) {
    return res.status(400).json({
      success: false,
      message: "Invalid food preference.",
    });
  }

  try {
    await db.promise().query(
      `UPDATE users SET
        age = ?,
        height = ?,
        weight = ?,
        gender = ?,
        goal = ?,
        activityLevel = ?,
        foodPreference = ?,
        isOnboardingComplete = 1
       WHERE id = ?`,
      [
        Number(age),
        Number(height),
        Number(weight),
        gender ? gender.trim() : null,
        goal.trim(),
        activityLevel.trim(),
        foodPreference || null,
        req.user.id,
      ]
    );

    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.json({
      success: true,
      message: "Onboarding completed successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    logAuthError("ONBOARDING ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Unable to complete onboarding right now.",
    });
  }
});

module.exports = router;
