/* ======================
   🚀 COMPLETE ONBOARDING
====================== */
router.post("/onboarding", protect, (req, res) => {

  const {
    age,
    height,
    weight,
    goal,
    activityLevel
  } = req.body;

  db.query(
    `UPDATE users
     SET
      age = ?,
      height = ?,
      weight = ?,
      goal = ?,
      activityLevel = ?,
      isOnboardingComplete = ?
     WHERE id = ?`,
    [
      age,
      height,
      weight,
      goal,
      activityLevel,
      true,
      req.user.id
    ],

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          success: false,
          message: "Onboarding failed ❌"
        });

      }

      /* ======================
         ✅ GET UPDATED USER
      ====================== */
      db.query(
        "SELECT * FROM users WHERE id = ?",
        [req.user.id],

        (err, users) => {

          if (err) {

            console.log(err);

            return res.status(500).json({
              success: false,
              message: "User fetch failed ❌"
            });

          }

          const user = users[0];

          res.json({
            success: true,
            message: "Onboarding complete ✅",

            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,

              isOnboardingComplete:
                Boolean(user.isOnboardingComplete),

              age: user.age,
              height: user.height,
              weight: user.weight,
              goal: user.goal,
              activityLevel:
                user.activityLevel
            }

          });

        }
      );

    }
  );

});