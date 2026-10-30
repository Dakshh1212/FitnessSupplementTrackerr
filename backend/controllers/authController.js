
/* ======================
   COMPLETE ONBOARDING
====================== */
router.post("/onboarding", protect, async (req, res) => {
  try {
    const { age, height, weight, goal, activityLevel } = req.body;

    const parsedAge = Number(age);
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);

    if (
      !Number.isFinite(parsedAge) ||
      !Number.isFinite(parsedHeight) ||
      !Number.isFinite(parsedWeight) ||
      !Number.isInteger(parsedAge) ||
      parsedAge < 13 ||
      parsedAge > 120 ||
      parsedHeight < 50 ||
      parsedHeight > 260 ||
      parsedWeight < 20 ||
      parsedWeight > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid age, height, and weight.",
      });
    }

    const allowedGoals = ["fat_loss", "muscle_gain", "maintenance"];
    const allowedActivityLevels = [
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
    ];

    if (!allowedGoals.includes(goal)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid fitness goal.",
      });
    }

    if (!allowedActivityLevels.includes(activityLevel)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid activity level.",
      });
    }

    const [updateResult] = await db.promise().query(
      `UPDATE users
       SET age = ?,
           height = ?,
           weight = ?,
           goal = ?,
           activityLevel = ?,
           isOnboardingComplete = ?
       WHERE id = ?`,
      [
        parsedAge,
        parsedHeight,
        parsedWeight,
        goal,
        activityLevel,
        1,
        req.user.id,
      ]
    );

    if (updateResult.affectedRows === 0) {
      const [existingUsers] = await db.promise().query(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [req.user.id]
      );

      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
    }

    const [users] = await db.promise().query(
      `SELECT id, name, email, role, age, height, weight,
              goal, activityLevel, isOnboardingComplete
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = users[0];

    return res.json({
      success: true,
      message: "Onboarding complete.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnboardingComplete: Boolean(user.isOnboardingComplete),
        age: user.age,
        height: user.height,
        weight: user.weight,
        goal: user.goal,
        activityLevel: user.activityLevel,
      },
    });
  } catch (error) {
    console.error("ONBOARDING ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete onboarding. Please try again.",
    });
  }
});
