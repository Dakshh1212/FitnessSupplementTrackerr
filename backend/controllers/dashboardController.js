exports.getDashboard = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    // 🔥 USER FETCH (NEW)
    const user = await User.findById(req.user.id);

    /* =======================
       🔥 DIET TOTAL
    ======================= */
    const dietTotal = await DietEntry.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$totalCalories" },
          totalProtein: { $sum: "$totalProtein" }
        }
      }
    ]);

    /* =======================
       🔥 DIET CHART
    ======================= */
    const dietChart = await DietEntry.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$date" },
            month: { $month: "$date" }
          },
          calories: { $sum: "$totalCalories" }
        }
      },
      { $sort: { "_id.day": 1 } }
    ]);

    /* =======================
       🔥 WORKOUT DATA (FIXED 🔥)
    ======================= */
    const workoutData = await WorkoutSession.aggregate([
      { $match: { user: userObjectId } }, // 🔥 FIXED (userId → user)
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 }
        }
      }
    ]);

    /* =======================
       🔥 SUPPLEMENT DATA (FIXED 🔥)
    ======================= */
    const supplementData = await SupplementIntake.aggregate([
      { $match: { user: userObjectId } }, // 🔥 FIXED
      {
        $group: {
          _id: null,
          totalSupplements: { $sum: 1 }
        }
      }
    ]);

    /* =======================
       🔥 SMART CALCULATIONS (NEW 🚀)
    ======================= */
    const consumedCalories = dietTotal[0]?.totalCalories || 0;
    const consumedProtein = dietTotal[0]?.totalProtein || 0;

    const recommendedCalories = calculateCalories(user);
    const recommendedProtein = user.weight * 1.6;

    const calorieProgress = Math.round(
      (consumedCalories / recommendedCalories) * 100
    );

    const proteinProgress = Math.round(
      (consumedProtein / recommendedProtein) * 100
    );

    /* =======================
       🔥 FINAL RESPONSE
    ======================= */
    res.status(200).json({
      success: true,
      data: {
        // 🔥 OLD
        totalCalories: consumedCalories,
        totalProtein: consumedProtein,

        // 🔥 NEW (THIS IS WOW)
        recommendedCalories,
        recommendedProtein,
        calorieProgress,
        proteinProgress,
        goal: user.goal,

        status:
          consumedCalories < recommendedCalories
            ? "Under Eating"
            : "On Track",

        // 🔥 OTHER DATA
        totalWorkouts: workoutData[0]?.totalWorkouts || 0,
        totalSupplements: supplementData[0]?.totalSupplements || 0,

        chartData: dietChart.map(d => ({
          day: `Day ${d._id.day}`,
          calories: d.calories
        }))
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};