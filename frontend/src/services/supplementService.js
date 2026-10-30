
import API from "./api";

// Get all available supplements.
export const getSupplements = async () => {
  const res = await API.get("/supplements");
  return res.data?.data || [];
};

// Create a supplement plan.
export const createPlan = async (data) => {
  const res = await API.post("/supplements/plans", data);
  return res.data;
};

// Get saved supplement plans.
export const getPlans = async () => {
  const res = await API.get("/supplements/plans");
  return res.data?.data || [];
};

/** Delete a saved supplement plan. */
export const deletePlan = async (planId) => {
  const id = Number(planId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("A valid plan ID is required.");
  }

  const res = await API.delete(`/supplements/plans/${id}`);
  return res.data;
};


// Log a supplement that was actually consumed.
export const logSupplementIntake = async ({
  supplementId,
  servings = 1,
  timing = "morning",
}) => {
  const res = await API.post("/supplements/take", {
    supplementId: Number(supplementId),
    servings: Number(servings),
    timing,
  });

  return res.data;
};

// Get supplement intake history.
export const getSupplementIntake = async () => {
  const res = await API.get("/supplements/intake");
  return res.data?.data || [];
};

// Get today's supplement protein and calories.
export const getTodaySupplementNutrition = async () => {
  const res = await API.get("/supplements/nutrition/today");
  return res.data?.data || {
    proteinConsumed: 0,
    caloriesConsumed: 0,
    intakeCount: 0,
  };
};

// Get today's logged supplement intake.
export const getTodaySupplementIntake = async () => {
  const res = await API.get("/supplements/reminders/today");
  return res.data?.data || [];
};

// Get dashboard totals, including supplements if supported by the backend.
export const getDailyGoals = async () => {
  const res = await API.get("/goals/daily");
  return res.data?.data || {};
};

export const getDashboardData = async () => {
  const res = await API.get("/dashboard");
  return res.data?.data || {};
};
