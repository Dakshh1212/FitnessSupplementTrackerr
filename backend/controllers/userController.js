
const db = require("../config/mysql");

function logDatabaseError(label, error) {
  console.error(`${label}:`, error.message);
}

/* ======================
   GET ALL USERS — ADMIN
====================== */
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      `SELECT
         id,
         name,
         email,
         role,
         height,
         weight,
         age,
         gender,
         goal,
         activityLevel,
         isOnboardingComplete,
         created_at
       FROM users
       ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    logDatabaseError("GET ALL USERS ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load users.",
    });
  }
};

/* ======================
   GET LOGGED-IN USER
====================== */
exports.getUserProfile = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  try {
    const [users] = await db.promise().query(
      `SELECT
         id,
         name,
         email,
         role,
         height,
         weight,
         age,
         gender,
         goal,
         activityLevel,
         photo,
         isOnboardingComplete,
         created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    logDatabaseError("GET PROFILE ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your profile.",
    });
  }
};
