const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = require("../config/mysql");
const sendWelcomeEmail = require("../utils/sendEmail");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* ======================
   🔑 TOKEN
====================== */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ======================
   🔐 REGISTER
====================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, height, weight, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required ❌"
      });
    }

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {

        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error ❌"
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            success: false,
            message: "User already exists ❌"
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          `INSERT INTO users 
          (name, email, password, height, weight, goal, isOnboardingComplete)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            email,
            hashedPassword,
            height || null,
            weight || null,
            goal || null,
            0
          ],
          async (err, result) => {

            if (err) {
              return res.status(500).json({
                success: false,
                message: "Server Error ❌"
              });
            }

            // email should NOT break signup
            try {
              await sendWelcomeEmail(email, name);
            } catch (e) {
              console.log("Email error:", e.message);
            }

            const user = {
              id: result.insertId,
              name,
              email,
              role: "user",
              isOnboardingComplete: false
            };

            const token = generateToken(user);

            return res.status(201).json({
              success: true,
              token,
              user
            });
          }
        );
      }
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error ❌"
    });
  }
});

/* ======================
   🔐 LOGIN
====================== */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error ❌"
        });
      }

      if (!results.length) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials ❌"
        });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials ❌"
        });
      }

      if (user.isBanned === 1) {
        return res.status(403).json({
          success: false,
          message: "You are banned ❌"
        });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isOnboardingComplete: user.isOnboardingComplete === 1
        }
      });
    }
  );
});

/* ======================
   👤 GET ME
====================== */
router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/* ======================
   ✏️ UPDATE PROFILE
====================== */
router.put("/update", protect, (req, res) => {
  const { name, height, weight, goal, age, gender, activityLevel, photo } = req.body;

  db.query(
    `UPDATE users SET
      name=?,
      height=?,
      weight=?,
      goal=?,
      age=?,
      gender=?,
      activityLevel=?,
      photo=?
     WHERE id=?`,
    [name, height, weight, goal, age, gender, activityLevel, photo, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Update failed ❌"
        });
      }

      res.json({
        success: true,
        message: "Profile updated ✅"
      });
    }
  );
});

/* ======================
   🚀 ONBOARDING
====================== */
router.post("/onboarding", protect, (req, res) => {
  const { age, height, weight, goal, activityLevel } = req.body;

  db.query(
    `UPDATE users SET
      age=?,
      height=?,
      weight=?,
      goal=?,
      activityLevel=?,
      isOnboardingComplete=1
     WHERE id=?`,
    [age, height, weight, goal, activityLevel, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Onboarding failed ❌"
        });
      }

      res.json({
        success: true,
        message: "Onboarding complete ✅"
      });
    }
  );
});

module.exports = router;